package types

// Support_Command represents
type Support_Command string

const (
    Support_Command_Null    Support_Command = ""
    Support_Command_Init    Support_Command = "init"
    Support_Command_Debug   Support_Command = "debug"
    Support_Command_Preview Support_Command = "preview"
    Support_Command_Publish Support_Command = "publish"
    Support_Command_Install Support_Command = "install"
)

// Support_Command represents Essential extracts from root package.json.
type Support_PackageEssential struct {
    Bin     string
    Name    string
    Version string
}

// Support_Command represents target modifications in watch mode
type Support_WatchEvent struct {
    TimeStamp   string
    Action      string
    Folder      string
    FilePath    string
    FileContent string
    Extension   string
}

// Support_Command represents diagnostic data for manifest
type Support_Diagnostic struct {
    Message string   `json:"message"`
    Sources []string `json:"sources"`
}
