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
