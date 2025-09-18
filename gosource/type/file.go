package types

// FileType represents the possible types of files
type File_Type string

const (
	Null       File_Type = "NULL"
	Artifact   File_Type = "ARTIFACT"
	Axiom      File_Type = "AXIOM"
	Cluster    File_Type = "CLUSTER"
	Target     File_Type = "TARGET"
	Stylesheet File_Type = "STYLESHEET"
)

// File_ClassMetaMap maps strings to style metadata
type File_ClassMetaMap map[string]Style_Metadata

// FileSource represents a source file
type File_Source struct {
	Path    string   `json:"path"`
	Frags   []string `json:"frags"`
	Content string   `json:"content"`
}

// FileSync extends FileSource with additional fields
type File_Sync struct {
	File_Source
	Title string `json:"title"`
	URL   string `json:"url"`
}

// FilePath extends FileSource with additional fields
type File_Path struct {
	File_Source
	Essential bool   `json:"essential"`
	Content   string `json:"content"`
}

// FilePosition represents a position in a file
type File_Position struct {
	Last        *string `json:"last"`
	Char        *string `json:"char"`
	Next        *string `json:"next"`
	Marker      int     `json:"marker"`
	RowMarker   int     `json:"rowMarker"`
	ColMarker   int     `json:"colMarker"`
	Cycle       int     `json:"cycle"`
	ColFallback int     `json:"colFallback"`
}

// FileLookup represents a lookup entry
type File_Lookup struct {
	ID   string    `json:"id"`
	Type File_Type `json:"type"`
}

// FileLocalManifest represents a local manifest
type File_LocalManifest struct {
	Lookup      File_Lookup          `json:"lookup"`
	Public      File_ClassMetaMap    `json:"public"`
	Global      File_ClassMetaMap    `json:"global"`
	Local       File_ClassMetaMap    `json:"local"`
	Errors      []string             `json:"errors"`
	Diagnostics []Support_Diagnostic `json:"diagnostics"`
}

// FileStorage represents storage configuration
type File_Storage struct {
	LibLevel        int                `json:"liblevel"`
	Artifact        string             `json:"artifact"`
	FilePath        string             `json:"filePath"`
	Extension       string             `json:"extension"`
	ClassFront      string             `json:"classFront"`
	SourcePath      string             `json:"sourcePath"`
	TargetPath      string             `json:"targetPath"`
	Content         string             `json:"content"`
	Midway          string             `json:"midway"`
	Scratch         string             `json:"scratch"`
	Label           string             `json:"label"`
	Manifesting     File_LocalManifest `json:"manifesting"`
	DebugClassFront string             `json:"debugclassFront"`
	StyleData       struct {
		Attachments     []string            `json:"attachments"`
		ClassTracks     [][]string          `json:"classTracks"`
		UsedIndexes     map[int]struct{}    `json:"usedIndexes"` // Using map to simulate Set
		LocalClasses    Style_ClassIndexMap `json:"localClasses"`
		GlobalClasses   Style_ClassIndexMap `json:"globalClasses"`
		PublicClasses   Style_ClassIndexMap `json:"publicClasses"`
		StyleMap        File_ClassMetaMap   `json:"styleMap"`
		TagReplacements [][2]int            `json:"tagReplacements"` // [ElementId, Position]
	} `json:"styleData"`
}
