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

type File_SymclassIndexMap map[string]int

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
	LocalClasses    Style_ClassIndexMap
	GlobalClasses   Style_ClassIndexMap
	PublicClasses   Style_ClassIndexMap
	TagReplacements []File_TagReplacement
}

type File_LocalManifest struct {
	Locals      File_SymclassIndexMap `json:"local"`
	Globals     File_SymclassIndexMap `json:"global"`
	Publics     File_SymclassIndexMap `json:"public"`
	Lookup      File_Lookup           `json:"lookup"`
	Errors      []string              `json:"errors"`
	Diagnostics []File_Diagnostic     `json:"diagnostics"`
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
