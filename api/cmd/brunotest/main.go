package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/FameNu/clinic-management-system/api/internal/config"
	"github.com/FameNu/clinic-management-system/api/internal/server"
	"github.com/jackc/pgx/v5"
	"gorm.io/gorm"
)

const (
	testDatabase = "clinic_test"
	testPort     = "8081"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := run(ctx); err != nil {
		fmt.Fprintln(os.Stderr, "Bruno integration test setup failed:", err)
		os.Exit(1)
	}
}

func run(ctx context.Context) (returnErr error) {
	config.LoadEnv()
	if strings.TrimSpace(os.Getenv("JWT_SECRET")) == "" {
		return errors.New("JWT_SECRET must be set in the environment or .env file")
	}

	adminConn, err := pgx.Connect(ctx, postgresAdminDSN())
	if err != nil {
		return fmt.Errorf("connect to PostgreSQL admin database: %w", err)
	}
	defer func() {
		closeCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := adminConn.Close(closeCtx); err != nil && returnErr == nil {
			returnErr = fmt.Errorf("close PostgreSQL admin connection: %w", err)
		}
	}()

	if _, err := adminConn.Exec(ctx, "DROP DATABASE IF EXISTS clinic_test WITH (FORCE)"); err != nil {
		return fmt.Errorf("drop previous %s database: %w", testDatabase, err)
	}
	defer func() {
		cleanupCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		if _, err := adminConn.Exec(cleanupCtx, "DROP DATABASE IF EXISTS clinic_test WITH (FORCE)"); err != nil {
			returnErr = errors.Join(returnErr, fmt.Errorf("drop %s database: %w", testDatabase, err))
		} else {
			fmt.Printf("Dropped temporary %s database.\n", testDatabase)
		}
	}()
	if _, err := adminConn.Exec(ctx, "CREATE DATABASE clinic_test"); err != nil {
		return fmt.Errorf("create %s database: %w", testDatabase, err)
	}

	restoreEnv, err := setEnv(map[string]string{
		"APP_ENV":      "development",
		"DB_NAME":      testDatabase,
		"DATABASE_URL": "",
		"PORT":         testPort,
	})
	if err != nil {
		return err
	}
	defer restoreEnv()

	db, err := config.OpenDB()
	if err != nil {
		return fmt.Errorf("open Fiber database: %w", err)
	}
	defer closeGORMDB(db, &returnErr)

	app := server.New(db)
	listener, err := net.Listen("tcp", net.JoinHostPort("127.0.0.1", testPort))
	if err != nil {
		return fmt.Errorf("listen on test port %s: %w", testPort, err)
	}
	serverDone := make(chan error, 1)
	go func() {
		serverDone <- app.Listener(listener)
	}()
	defer shutdownFiber(app, serverDone, &returnErr)

	if err := waitForHealth(ctx, "http://"+net.JoinHostPort("127.0.0.1", testPort)+"/api/v1/health"); err != nil {
		return err
	}

	return runBruno(ctx)
}

func postgresAdminDSN() string {
	host := envOrDefault("POSTGRES_HOST", "localhost")
	port := envOrDefault("POSTGRES_PORT", "5432")
	user := envOrDefault("POSTGRES_USER", "postgres")
	password := envOrDefault("POSTGRES_PASSWORD", "password")

	adminURL := url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(user, password),
		Host:   net.JoinHostPort(host, port),
		Path:   "/postgres",
	}
	query := adminURL.Query()
	query.Set("sslmode", "disable")
	adminURL.RawQuery = query.Encode()
	return adminURL.String()
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func setEnv(values map[string]string) (func(), error) {
	type previousValue struct {
		value   string
		present bool
	}
	previous := make(map[string]previousValue, len(values))
	for key, value := range values {
		oldValue, present := os.LookupEnv(key)
		previous[key] = previousValue{value: oldValue, present: present}
		if err := os.Setenv(key, value); err != nil {
			restore := func() {
				for restoreKey, old := range previous {
					if old.present {
						_ = os.Setenv(restoreKey, old.value)
					} else {
						_ = os.Unsetenv(restoreKey)
					}
				}
			}
			restore()
			return nil, fmt.Errorf("set %s: %w", key, err)
		}
	}
	return func() {
		for key, old := range previous {
			if old.present {
				_ = os.Setenv(key, old.value)
			} else {
				_ = os.Unsetenv(key)
			}
		}
	}, nil
}

func waitForHealth(ctx context.Context, healthURL string) error {
	deadline := time.NewTimer(30 * time.Second)
	defer deadline.Stop()
	ticker := time.NewTicker(250 * time.Millisecond)
	defer ticker.Stop()
	client := &http.Client{Timeout: 1 * time.Second}

	for {
		request, err := http.NewRequestWithContext(ctx, http.MethodGet, healthURL, nil)
		if err == nil {
			response, requestErr := client.Do(request)
			if requestErr == nil {
				_, _ = io.Copy(io.Discard, response.Body)
				_ = response.Body.Close()
				if response.StatusCode == http.StatusOK {
					return nil
				}
			}
		}

		select {
		case <-ctx.Done():
			return fmt.Errorf("wait for Fiber health endpoint: %w", ctx.Err())
		case <-deadline.C:
			return errors.New("Fiber health endpoint did not become ready within 30 seconds")
		case <-ticker.C:
		}
	}
}

func runBruno(ctx context.Context) error {
	repoRoot, err := findRepoRoot()
	if err != nil {
		return err
	}
	cliPath := filepath.Join(repoRoot, "test", "node_modules", ".bin", "bru")
	if _, err := os.Stat(cliPath); err != nil {
		return fmt.Errorf("Bruno CLI is missing; run `make bruno-setup`: %w", err)
	}

	collectionDir := filepath.Join(repoRoot, "test", "clinic-integration-test")
	command := exec.CommandContext(ctx, cliPath, "run", "--env", "test", "-r")
	command.Dir = collectionDir
	command.Stdout = os.Stdout
	command.Stderr = os.Stderr
	if err := command.Run(); err != nil {
		return fmt.Errorf("Bruno CLI failed: %w", err)
	}
	return nil
}

func findRepoRoot() (string, error) {
	directory, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("find repository root: %w", err)
	}
	for {
		collection := filepath.Join(directory, "test", "clinic-integration-test", "opencollection.yml")
		module := filepath.Join(directory, "api", "go.mod")
		if _, collectionErr := os.Stat(collection); collectionErr == nil {
			if _, moduleErr := os.Stat(module); moduleErr == nil {
				return directory, nil
			}
		}
		parent := filepath.Dir(directory)
		if parent == directory {
			return "", errors.New("could not find repository root from current directory")
		}
		directory = parent
	}
}

func closeGORMDB(db *gorm.DB, returnErr *error) {
	sqlDB, err := db.DB()
	if err == nil {
		err = sqlDB.Close()
	}
	if err != nil {
		*returnErr = errors.Join(*returnErr, fmt.Errorf("close Fiber database: %w", err))
	}
}

func shutdownFiber(app interface{ Shutdown() error }, serverDone <-chan error, returnErr *error) {
	if err := app.Shutdown(); err != nil {
		*returnErr = errors.Join(*returnErr, fmt.Errorf("shut down Fiber: %w", err))
	}
	select {
	case err := <-serverDone:
		if err != nil && !errors.Is(err, net.ErrClosed) {
			*returnErr = errors.Join(*returnErr, fmt.Errorf("Fiber server stopped: %w", err))
		}
	case <-time.After(5 * time.Second):
		*returnErr = errors.Join(*returnErr, errors.New("Fiber server did not stop within 5 seconds"))
	}
	fmt.Println("Stopped test Fiber server.")
}
