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


type File_ClassMetaMap map[string]Style_Metadata

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

type File_LocalManifest struct {
	Lookup      File_Lookup          `json:"lookup"`
	Public      File_ClassMetaMap    `json:"public"`
	Global      File_ClassMetaMap    `json:"global"`
	Local       File_ClassMetaMap    `json:"local"`
	Errors      []string             `json:"errors"`
	Diagnostics []Support_Diagnostic `json:"diagnostics"`
}

type File_TagReplacement struct{
	Loc int
	Elid int
}

type File_StyleData struct {
	Attachments     []string              `json:"attachments"`
	ClassTracks     [][]string            `json:"classTracks"`
	UsedIndexes     []int			      `json:"usedIndexes"` 
	LocalClasses    Style_ClassIndexMap   `json:"localClasses"`
	GlobalClasses   Style_ClassIndexMap   `json:"globalClasses"`
	PublicClasses   Style_ClassIndexMap   `json:"publicClasses"`
	StyleMap        File_ClassMetaMap     `json:"styleMap"`
	TagReplacements []File_TagReplacement `json:"tagReplacements"` 
}
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
	StyleData       File_StyleData     `json:"styleData"`
}
