package models

type Cache_Url struct {
	Docs      string
	Site      string
	Worker    string
	Console   string
	Vendors   string
	Artifacts string
}

type Cache_Root struct {
	Name             string
	Interval         uint
	Version          string
	Extension        string
	Commands         map[string]string
	CustomAtrules    map[string]string
	CustomTags       map[string]int
	CustomOperations map[string]rune
	Url              Cache_Url
	Tweaks           Config_Tweaks
}

type Cache_Static struct {
	WATCH             bool
	DEBUG             bool
	MINIFY            bool
	Command           string
	Argument          string
	RootCSS           string
	RootPath          string
	WorkPath          string
	ProjectName       string
	ProjectVersion    string
	Hashrule          map[string]string
	Artifacts_Sources map[string]string
	Artifacts_Saved   map[string]string
	Libraries_Saved   map[string]string
	TargetDir_Saved   map[string]Config_ProxyStorage
	Tweaks            Config_Tweaks
	ProxyMap          []Config_ProxyMap
	CustomTags        []string
}

type Cache_Delta_Report struct {
	Artifacts string
	Axioms    string
	Clusters  string
	TargetDir string
	Constants string
	Hashrule  string
	Errors    string
	MemChart  string
	Footer    string
}

type Cache_Delta_Lookup struct {
	Artifacts map[string]File_Lookup
	Libraries map[string]File_Lookup
	TargetDir map[string]File_Lookup
}

type Cache_Delta_Errors struct {
	Artifacts []string
	Axioms    []string
	Clusters  []string
	Multiples []string
	TargetDir []string
	Hashrules []string
	Handoffs  []string
}

type Cache_Delta_Diagnostics struct {
	Artifacts []File_Diagnostic
	Axioms    []File_Diagnostic
	Clusters  []File_Diagnostic
	TargetDir []File_Diagnostic
	Multiples []File_Diagnostic
	Hashrules []File_Diagnostic
	Handoffs  []File_Diagnostic
}

type Cache_Delta struct {
	Path         string
	Content      string
	PublishError string
	FinalMessage string
	Errors       []string
	IndexAttach  []int
	IndexBuild   string
	Report       Cache_Delta_Report
	Lookup       Cache_Delta_Lookup
	Error        Cache_Delta_Errors
	Diagnostic   Cache_Delta_Diagnostics
}

type Cache_Style struct {
	Hashrules       map[string]string
	Index_to_Data   map[int]*Style_ClassData
	Global___Index  Style_ClassIndexMap
	Public___Index  Style_ClassIndexMap
	Library__Index  Style_ClassIndexMap
	Artifact_Index  Style_ClassIndexMap
	ClassDictionary Style_Dictionary
	PublishIndexMap []Style_ClassIndexTrace
}

type Cache_Manifest_Groups struct {
	Axiom    map[string]File_SymclassIndexMap `json:"axiom"`
	Cluster  map[string]File_SymclassIndexMap `json:"cluster"`
	Local    map[string]File_SymclassIndexMap `json:"local"`
	Global   map[string]File_SymclassIndexMap `json:"global"`
	Artifact map[string]File_SymclassIndexMap `json:"artifact"`
}

type Cache_Manifest struct {
	Constants   map[string]string      `json:"constants"`
	Diagnostics []File_Diagnostic      `json:"diagnostics"`
	Lookup      map[string]File_Lookup `json:"lookup"`
	Group       Cache_Manifest_Groups  `json:"group"`
}
