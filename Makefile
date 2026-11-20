.PHONY: git-pull rm-latest-commit db-up db-down

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
