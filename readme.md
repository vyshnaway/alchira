
# Directory structure reference

```
project-root/
  ├── cmd/
  │   ├── root.go          # Main command setup
  │   └── subcmd.go        # Subcommands or additional CLI features
  ├── internal/            # Helpers/utilities only for this project
  │   ├── fileutils/
  │   └── apiutils/
  ├── models/              # Common structs and types
  ├── services/            # Core business logic
  ├── pkg/                 # (Optional) Exported packages for reuse
  ├── configs/             # CLI configs, templates, defaults
  ├── scripts/             # Helper scripts for dev/build
  ├── test/                # Integration/system tests
  ├── go.mod
  ├── go.sum
  └── README.md
```

- P_ : Function Params
- T_ : Type
- R_ : Return Type
- E_ : Enum
- _* : Private Global in module

## Return sequence for functions
```
Result Report Status Error 
Output Message Status Error 
```

---
css vendor load
