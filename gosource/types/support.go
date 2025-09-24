package types

type Support_Command string

const (
    Support_Command_Null    Support_Command = ""
    Support_Command_Init    Support_Command = "init"
    Support_Command_Debug   Support_Command = "debug"
    Support_Command_Preview Support_Command = "preview"
    Support_Command_Publish Support_Command = "publish"
    Support_Command_Install Support_Command = "install"
)

type Support_WatchEvent struct {
    TimeStamp   string
    Action      string
    Folder      string
    FilePath    string
    FileContent string
    Extension   string
}

type Support_PackageEssential struct {
    Bin     string `json:"bin"`
    Name    string `json:"name"`
    Version string `json:"version"`
}

type Support_Diagnostic struct {
    Message string   `json:"message"`
    Sources []string `json:"sources"`
}

type Support_SortedOutput struct {
	Counted        int                           `json:"counted"`
	ReferenceMap   map[string]map[int]int        `json:"referenceMap"`
	RecompClasslist [][2]int                     `json:"recompClasslist"`
}

