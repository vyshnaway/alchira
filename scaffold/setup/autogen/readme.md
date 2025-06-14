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