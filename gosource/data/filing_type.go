package data

// T_FilingResult defines the structure for the metadata extracted and processed by the FILING function.
type T_FilingResult struct {
	ID               int                    `json:"id"`
	Group            string                 `json:"group"`
	Stamp            string                 `json:"stamp"`
	Cluster          string                 `json:"cluster"`
	FilePath         string                 `json:"filePath"`
	FileName         string                 `json:"fileName"`
	Extension        string                 `json:"extension"`
	SourcePath       string                 `json:"sourcePath"`
	TargetPath       string                 `json:"targetPath"`
	MetaFront        string                 `json:"metaFront"`
	Content          string                 `json:"content"`
	UsedIndexes      map[int]struct{}       `json:"usedIndexes"` // Using map[int]struct{} for Set equivalent
	Essentials       []interface{}          `json:"essentials"`
	StyleGlobals     map[string]interface{} `json:"styleGlobals"`
	StyleLocals      map[string]interface{} `json:"styleLocals"`
	StyleMap         map[string]interface{} `json:"styleMap"`
	ClassGroups      []interface{}          `json:"classGroups"`
	PostBinds        []interface{}          `json:"postBinds"`
	PreBinds         []interface{}          `json:"preBinds"`
	Errors           []string               `json:"errors"`
	Summon           bool                   `json:"summon"`
	HasStyleTag      bool                   `json:"hasStyleTag"`
	HasStylesheetTag bool                   `json:"hasStylesheetTag"`
	HasSnippetTag    bool                   `json:"hasSnippetTag"`
	Midway           string                 `json:"midway"`
}
