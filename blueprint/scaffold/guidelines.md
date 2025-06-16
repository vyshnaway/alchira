
---

# Git Submodules Quick Guide

Basic commands for managing portable-bundle and portable-native submodules.

## Essential Commands

```bash
# Add submodules
git submodule add <repository-url> xtyles/portables
git submodule add <repository-url> xtyles/portables

# Clone project with submodules
git clone <repository-url>
git submodule update --init --recursive

# Update submodules
git submodule update --remote
```

## Common Tasks

### Check Status
```bash
git submodule status
```

### Update a Submodule
```bash
cd xtyles/autogen/portable-bundle
git pull
cd ../../
git add xtyles/autogen/portable-bundle
git commit -m "Update submodule"
```

### Remove a Submodule
```bash
git submodule deinit -f xtyles/autogen/portable-bundle
git rm -f xtyles/autogen/portable-bundle
```

## Quick Reference

- Always run `git submodule update --init --recursive` after cloning
- Keep submodules up to date with `git submodule update --remote`
- Commit submodule changes in both the submodule and main project

## Additional Resources

- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Git Submodule Tutorial](https://git-scm.com/docs/git-submodule)
- [Git Submodule Cheat Sheet](https://git-scm.com/docs/git-submodule#_commands) 