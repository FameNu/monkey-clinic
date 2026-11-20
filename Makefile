.PHONY: git-pull rm-latest-commit db-up db-down

.PHONY: git-pull
git-pull:
	@echo "Fetching and pulling latest changes from remote repository..."
	git fetch --all
	git pull origin development
	@echo "Done!"

.PHONY: rm-latest-commit
rm-latest-commit:
	@echo "Removing the latest commit from the current branch..."
	git reset --soft HEAD~1
	@echo "Done!"

.PHONY: db-up
db-up:
	@echo "Starting the PostgreSQL database using Docker Compose..."
	docker compose up -d db
	@echo "Done!"

.PHONY: db-down
db-down:
	@echo "Stopping the PostgreSQL database using Docker Compose..."
	docker compose down db
	@echo "Done!"
