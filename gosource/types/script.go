package types

type Script_Action int

const (
	Script_Action_Read Script_Action = iota
	Script_Action_Sync
	Script_Action_Watch
	Script_Action_Monitor
)

type Script_RawStyle struct {
	Elid         int
	Element      string
	Elvalue      string
	TagCount     int
	RowIndex     int
	ColIndex     int
	EndMarker    int
	Symclasses   []string
	Scope        Style_Type
	Comments     []string
	Attachstring string
	Styles       map[string]string
	Attributes   map[string]string
}

type Script_Cumulated struct {
	Report        []string
	GlobalClasses map[string]int
	PublicClasses map[string]int
	FileManifests map[string]File_LocalManifest
}

type Script_Target struct {
	Source            string
	Target            string
	Stylesheet        string
	SourceStylesheet  string
	TargetStylesheet  string
	StylesheetContent string

	Label      string
	Extensions []string
	ExtnsProps map[string][]string
	FileCache  map[string]File_Storage
}
