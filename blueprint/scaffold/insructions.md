
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

# FILE: manifest.json

- This file will be used by extension and Ai agents to refer active library and portables.
- Manifest will auto generated only by a active running "watch" command.

```json
{
    "constants": string[],
    // - array of all constants from `#constants.css`.

    "hashrule": map{hashrule: value},
    // - map active valid hashrules with assigned value.

    "file": map{
        filePath: {
            group: "axiom"|"cluster"|"binding"|"portable"|"stylesheet"|"target",
            id: filePath|index
        }
    },
    // - targetable file for by extension
    // - provide guidelines on how to accumulates style for a specific file

    "binding": map{filepath, xtyles[]},
    // - uses { "group": "binding", "id": filepath}
    // - xtyles scoped acrross target folders and within `portables` folder

    "portable": map{filepath, xtyles[]},
    // - uses { "group": "target", "id": filepath}
    // - xtyles scoped acrross target folders and within `portables` folder

    "local": map{filepath, xtyles[]},
    // - xtyles scoped within each file
    // - uses { "group": "target", "id": filepath}

    "global": map{filepath, xtyles[]},
    // - xtyles scoped across all proxy folders
    // - uses { "group": "target", "id": filepath}

    "axiom": map{index, xtyles[]},
    // - uses { "group": "axiom", "id": index}
    // - xtyles scoped across all proxy folders, and axioms with lesser index

    "cluster": map{index, xtyles[]},
    // - uses { "group": "cluster", "id": index}
    // - xtyles scoped across all proxy folders, all axioms and clusters with lesser index, indipendent of cluster group
}
```

# FOLDER: portable-bundle.json

- Includes external portables, bindings and corresponding mardown.
- Portable version of functional classes, and its bindings.
- Define as git submodule to use across multiple projects.

# FOLDER: portable-native.json

- Only native portables, bindings and `guidelines.md`.
- Portable version of functional classes, and its bindings.
- Define as git submodule to use across multiple projects.
