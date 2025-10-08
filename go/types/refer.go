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

type Refer_Diagnostic struct {
	Message string   `json:"message"`
	Sources []string `json:"sources"`
}

type Refer_SortedOutput struct {
	Count           int                 `json:"count"`
	ClassLists      [][]int             `json:"classlist"`
	List_to_GroupId map[string]int      `json:"listToGroup"`
	Group_to_Table  map[int]map[int]int `json:"groupToMap"`
	Final_Hashtrace [][2]int            `json:"recompClasslist"`
}
