package data

// T_FilingResult defines the structure for the metadata extracted and processed by the FILING function.
type T_FilingResult struct {
	ID               int              `json:"id"`
	Group            string           `json:"group"`
	Stamp            string           `json:"stamp"`
	Cluster          string           `json:"cluster"`
	FilePath         string           `json:"filePath"`
	FileName         string           `json:"fileName"`
	Extension        string           `json:"extension"`
	SourcePath       string           `json:"sourcePath"`
	TargetPath       string           `json:"targetPath"`
	MetaFront        string           `json:"metaFront"`
	Content          string           `json:"content"`
	UsedIndexes      map[int]struct{} `json:"usedIndexes"` // Using map[int]struct{} for Set equivalent
	Essentials       []any            `json:"essentials"`
	StyleGlobals     map[string]any   `json:"styleGlobals"`
	StyleLocals      map[string]any   `json:"styleLocals"`
	StyleMap         map[string]any   `json:"styleMap"`
	ClassGroups      []any            `json:"classGroups"`
	PostBinds        []any            `json:"postBinds"`
	PreBinds         []any            `json:"preBinds"`
	Errors           []string         `json:"errors"`
	Summon           bool             `json:"summon"`
	HasStyleTag      bool             `json:"hasStyleTag"`
	HasStylesheetTag bool             `json:"hasStylesheetTag"`
	HasSnippetTag    bool             `json:"hasSnippetTag"`
	Midway           string           `json:"midway"`
}
