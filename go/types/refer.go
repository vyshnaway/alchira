package types

type Refer_Command string

const (
	Refer_Command_Null    Refer_Command = ""
	Refer_Command_Init    Refer_Command = "init"
	Refer_Command_Debug   Refer_Command = "debug"
	Refer_Command_Preview Refer_Command = "preview"
	Refer_Command_Publish Refer_Command = "publish"
	Refer_Command_Install Refer_Command = "install"
)

type Refer_WatchEvent struct {
	TimeStamp   string
	Action      string
	Folder      string
	FilePath    string
	FileContent string
	Extension   string
}

type Refer_PackageEssential struct {
	Bin     map[string]string `json:"bin"`
	Scripts map[string]string `json:"bin"`
	Name    string            `json:"name"`
	Version string            `json:"version"`
}

type Refer_Diagnostic struct {
	Message string   `json:"message"`
	Sources []string `json:"sources"`
}

type Refer_SortedOutput struct {
	Count           int                    `json:"count"`
	ReferenceMap    map[string]map[int]int `json:"referenceMap"`
	RecompClasslist [][2]int               `json:"recompClasslist"`
}
