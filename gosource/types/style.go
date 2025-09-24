package types

type Style_Type int

const (
	Style_Type_Null Style_Type = iota
	Style_Type_Local
	Style_Type_Global
	Style_Type_Public
	Style_Type_Library
	Style_Type_Archive
	Style_Type_Arctach
	Style_Type_Artifact
)

var Style_TypeImport = []string{
	"",
	"LOCAL",
	"GLOBAL",
	"PUBLIC",
	"LIBRARY",
	"ARCHIVE",
	"ARCTACH",
	"ARTIFACT",
}

type Style_ExportStyle struct {
	Element     string
	SymClass    string
	InnerText   string
	Stylesheet  [][2]string
	Attributes  [][2]string
	Attachments []string
}

type Style_Metadata struct {
	Info         []string
	Skeleton     any
	Declarations []string
	WatchClass   string
	Variables    map[string]string
	Summon       string
	Attributes   map[string]string
}

type Style_ClassData struct {
	Index         int
	Metadata      Style_Metadata
	Artifact      string
	Definent      string
	SymClass      string
	DebugClass    string
	Attachments   []string
	Declarations  []string
	StyleObject   map[string]any
	SnippetStaple string
	SnippetStyle  any
}

type Style_Dictionary map[string]map[int]string

type Style_ClassIndexMap map[string]int

type Style_ClassIndexTrace struct{
	ClassName   string
	ClassIndex  int
}