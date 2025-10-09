package types

type File_Type string

const (
	File_Type_Null       File_Type = "NULL"
	File_Type_Artifact   File_Type = "ARTIFACT"
	File_Type_Axiom      File_Type = "AXIOM"
	File_Type_Cluster    File_Type = "CLUSTER"
	File_Type_Target     File_Type = "TARGET"
	File_Type_Stylesheet File_Type = "STYLESHEET"
)

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

type File_MetadataMap map[string]*Style_Metadata

type File_Source struct {
	Title     string   `json:"title"`
	Url       string   `json:"url"`
	Path      string   `json:"path"`
	Frags     []string `json:"frags"`
	Content   string   `json:"content"`
	Essential bool     `json:"essential"`
}

type File_Lookup struct {
	Id     string    `json:"id"`
	Type   File_Type `json:"type"`
	Locale []string  `json:"locale"`
}

type File_TagReplacement struct {
	Loc  int
	Elid int
}

type File_StyleData struct {
	UsedIn          []int
	Locales         []string
	Attachments     []string
	ClassTracks     [][]string
	LocalClasses    Style_ClassIndexMap
	GlobalClasses   Style_ClassIndexMap
	PublicClasses   Style_ClassIndexMap
	TagReplacements []File_TagReplacement
}

type File_LocalManifest struct {
	Local       File_MetadataMap   `json:"local"`
	Global      File_MetadataMap   `json:"global"`
	Public      File_MetadataMap   `json:"public"`
	Lookup      File_Lookup        `json:"lookup"`
	Errors      []string           `json:"errors"`
	Diagnostics []Refer_Diagnostic `json:"diagnostics"`
}

type File_Stash struct {
	LibLevel   int
	Artifact   string
	FilePath   string
	Extension  string
	ClassFront string
	SourcePath string
	TargetPath string
	Content    string
	Midway     string
	Scratch    string
	Label      string
	DebugFront string
	StyleData  File_StyleData
	Manifest   File_LocalManifest
}
