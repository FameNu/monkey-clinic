.PHONY: git-pull rm-latest-commit db-up db-down db-reset api-run api-tidy bruno-setup bruno-test

git-pull:
	@echo "Fetching and pulling latest changes from remote repository..."
	git fetch --all
	git pull origin development
	@echo "Done!"

rm-latest-commit:
	@echo "Removing the latest commit from the current branch..."
	git reset --soft HEAD~1
	@echo "Done!"

db-up:
	@echo "Starting the PostgreSQL database using Docker Compose..."
	docker compose up -d db
	@echo "Done!"

db-down:
	@echo "Stopping the PostgreSQL database using Docker Compose..."
	docker compose down db
	@echo "Done!"

db-reset:
	@echo "Resetting the local PostgreSQL database and deleting its volume..."
	docker compose down -v
	docker compose up -d
	@echo "Done!"

api-run:
	@echo "Starting Go Fiber API..."
	cd api && go run cmd/server/main.go

api-tidy:
	cd api && go mod tidy

bruno-setup:
	npm --prefix test ci

bruno-test:
	cd api && go run ./cmd/brunotest
