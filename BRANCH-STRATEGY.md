# Branch Strategy Guide

## Branch Overview

This repository uses a feature branch strategy to separate changes for different parts of the application.

### Main Branches

- **`main`** - Production-ready code
- **`feature/cms-admin-separation`** - Base feature branch for CMS/Admin separation work

### Feature Branches

- **`feature/admin-portal`** - For admin portal changes only
  - Changes to `admin-frontend/` directory
  - Admin-specific backend routes (`backend/src/routes/admin/`)
  - Admin-related shared components
  
- **`feature/public-app`** - For public website changes only
  - Changes to `frontend/` directory
  - Public API routes
  - Public-facing features

## Workflow

### Working on Admin Portal

```bash
# Switch to admin portal branch
git checkout feature/admin-portal

# Make your changes to admin-frontend/, backend/src/routes/admin/, etc.
# Stage and commit your changes
git add admin-frontend/
git add backend/src/routes/admin/
git commit -m "feat(admin): your change description"

# Push to remote
git push origin feature/admin-portal
```

### Working on Public App

```bash
# Switch to public app branch
git checkout feature/public-app

# Make your changes to frontend/, public routes, etc.
# Stage and commit your changes
git add frontend/
git add backend/src/routes/articles.ts  # example public route
git commit -m "feat(public): your change description"

# Push to remote
git push origin feature/public-app
```

### Shared Changes (Backend, Shared Components)

If you need to make changes that affect both:

```bash
# Make the change on the base branch
git checkout feature/cms-admin-separation

# Make your changes
git add backend/src/services/
git add shared/
git commit -m "feat(shared): your change description"

# Merge into both feature branches
git checkout feature/admin-portal
git merge feature/cms-admin-separation

git checkout feature/public-app
git merge feature/cms-admin-separation
```

## Directory Ownership

### Admin Portal (`feature/admin-portal`)
- `admin-frontend/` - All admin frontend code
- `backend/src/routes/admin/` - Admin API routes
- `backend/src/models/AdminEmail.ts` - Admin-specific models
- `backend/src/jobs/` - Background jobs (cleanup, etc.)
- Admin-related documentation

### Public App (`feature/public-app`)
- `frontend/` - All public frontend code
- `backend/src/routes/` (non-admin) - Public API routes
- Public-facing features and pages
- Public documentation

### Shared (`feature/cms-admin-separation`)
- `backend/src/db/` - Database migrations and schema
- `backend/src/middleware/` - Shared middleware
- `backend/src/services/` - Shared services (S3, email, etc.)
- `backend/src/utils/` - Utility functions
- `shared/` - Shared components and contexts
- Root configuration files

## Commit Message Convention

Use conventional commits format:

```
feat(admin): add mailbox feature
fix(public): resolve article loading issue
chore(shared): update dependencies
docs(admin): update admin portal guide
```

Prefixes:
- `feat` - New feature
- `fix` - Bug fix
- `chore` - Maintenance tasks
- `docs` - Documentation
- `refactor` - Code refactoring
- `test` - Adding tests
- `style` - Code style changes

Scopes:
- `admin` - Admin portal changes
- `public` - Public app changes
- `shared` - Shared code changes
- `backend` - Backend-only changes
- `frontend` - Frontend-only changes

## Merging Strategy

### Merging Feature Branches to Base

```bash
# Update base branch with admin changes
git checkout feature/cms-admin-separation
git merge feature/admin-portal

# Update base branch with public changes
git checkout feature/cms-admin-separation
git merge feature/public-app
```

### Merging to Main

```bash
# Only merge from base branch to main
git checkout main
git merge feature/cms-admin-separation

# Push to remote
git push origin main
```

## Viewing Current Branch

```bash
# Show current branch
git branch

# Show all branches
git branch -a

# Show branch with last commit
git branch -v
```

## Checking Branch Status

```bash
# See what files changed
git status

# See what's different from another branch
git diff feature/admin-portal..feature/public-app
```

## Best Practices

1. **Keep branches focused** - Admin changes on admin branch, public changes on public branch
2. **Commit often** - Small, focused commits are easier to review and merge
3. **Pull before push** - Always pull latest changes before pushing
4. **Test before merging** - Run tests on your branch before merging
5. **Clear commit messages** - Use conventional commits format
6. **Sync regularly** - Merge base branch into feature branches regularly to avoid conflicts

## Troubleshooting

### Merge Conflicts

```bash
# If you get conflicts during merge
git status  # See which files have conflicts

# Edit conflicted files, then:
git add <resolved-files>
git commit
```

### Accidentally Committed to Wrong Branch

```bash
# If you committed to wrong branch
git log  # Find the commit hash

# Switch to correct branch
git checkout feature/admin-portal

# Cherry-pick the commit
git cherry-pick <commit-hash>

# Go back to wrong branch and reset
git checkout feature/public-app
git reset --hard HEAD~1  # Remove last commit
```

### Need to Move Uncommitted Changes

```bash
# Stash your changes
git stash

# Switch to correct branch
git checkout feature/admin-portal

# Apply stashed changes
git stash pop
```

## Quick Reference

```bash
# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout feature/admin-portal

# See all branches
git branch -a

# Delete local branch
git branch -d feature/old-branch

# Push branch to remote
git push origin feature/admin-portal

# Pull latest from remote
git pull origin feature/admin-portal

# Merge another branch into current
git merge feature/cms-admin-separation

# See commit history
git log --oneline --graph --all
```

## Current Branch Status

As of now:
- `feature/admin-portal` - Created, ready for admin portal work
- `feature/public-app` - Created, ready for public app work
- `feature/cms-admin-separation` - Base branch with all current changes

All branches currently have the same code. Start making changes on the appropriate branch based on what you're working on.
