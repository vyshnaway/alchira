package types

type Target_Action int

const (
	Target_Action_Read Target_Action = iota
	Target_Action_Sync
	Target_Action_Watch
	Target_Action_Monitor
)

type Script_RawStyle struct {
	Elid       int
	Element    string
	Elvalue    string
	TagCount   int
	RowIndex   int
	ColIndex   int
	EndMarker  int
	Symclasses []string
	Scope      Style_Type
	Comments   []string
	Innertext  string
	Styles     map[string]string
	Attributes map[string]string
}

type Target_Accumulate struct {
	Report        []string
	GlobalClasses map[string]int
	PublicClasses map[string]int
	FileManifests map[string]*File_LocalManifest
}

type Target_Stash struct {
	Source            string
	Target            string
	Stylesheet        string
	SourceStylesheet  string
	TargetStylesheet  string
	StylesheetContent string

	Label      string
	Extensions []string
	ExtnsProps map[string][]string
	FileCache  map[string]File_Stash
}
