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

type File_SymclassMetadataMap map[string]*Style_Metadata

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
	Assign []string  `json:"assign"`
	Attach []string  `json:"attach"`
	Locale []string  `json:"locale"`
}

type File_TagReplacement struct {
	Loc  int
	Elid int
}

type File_StyleData struct {
	UsedIndexes     []int
	Attachments     []string
	ClassTracks     [][]string
	LocalClasses    Style_ClassIndexMap
	GlobalClasses   Style_ClassIndexMap
	PublicClasses   Style_ClassIndexMap
	TagReplacements []File_TagReplacement
}

type File_LocalManifest struct {
	Local       File_SymclassMetadataMap `json:"local"`
	Global      File_SymclassMetadataMap `json:"global"`
	Public      File_SymclassMetadataMap `json:"public"`
	Lookup      File_Lookup              `json:"lookup"`
	Errors      []string                 `json:"errors"`
	Diagnostics []Refer_Diagnostic       `json:"diagnostics"`
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
