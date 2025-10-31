package models

type File_Type string

const (
	File_Type_Null       File_Type = "null"
	File_Type_Artifact   File_Type = "artifact"
	File_Type_Axiom      File_Type = "axiom"
	File_Type_Cluster    File_Type = "cluster"
	File_Type_Target     File_Type = "target"
	File_Type_Stylesheet File_Type = "stylesheet"
)

type File_Diagnostic struct {
	Message string   `json:"message"`
	Sources []string `json:"sources"`
}

type File_Source struct {
	Title     string   `json:"title"`
	Url       string   `json:"url"`
	Path      string   `json:"path"`
	Frags     []string `json:"frags"`
	Content   string   `json:"content"`
	Essential bool     `json:"essential"`
}

type File_Lookup struct {
	Id   string    `json:"id"`
	Type File_Type `json:"type"`
}

type File_TagReplacement struct {
	Loc  int
	Elid int
}

type File_StyleData struct {
	UsedIn          []int
	Attachments     map[string]bool
	ClassTracks     [][]string
	MixedMap        Style_ClassIndexMap
	LocalMap        Style_ClassIndexMap
	GlobalMap       Style_ClassIndexMap
	PublicMap       Style_ClassIndexMap
	TagReplacements []File_TagReplacement
}

type File_Stash struct {
	LibLevel    int
	Artifact    string
	FilePath    string
	Extension   string
	ClassFront  string
	SourcePath  string
	TargetPath  string
	Content     string
	Midway      string
	Scratch     string
	Label       string
	DebugFront  string
	WatchAttrs  []string
	StyleData   File_StyleData
	Lookup      File_Lookup
	Errors      []string
	Diagnostics []*File_Diagnostic
}

type Style_ClassIndexTrace struct {
	ClassName  string
	ClassIndex int
}

type T_Position struct {
	Row int
	Col int
	Pos int
}
