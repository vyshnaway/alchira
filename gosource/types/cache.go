package types

type Cache_Url struct {
	Cdn       string
	Site      string
	Worker    string
	Console   string
	Prefixes  string
	Artifacts string
}

type Cache_Root struct {
	Bin              string
	Name             string
	Version          string
	Extension        string
	Scripts          map[string]string
	Commands         map[string]string
	Tweaks           Config_Tweaks
	CustomAtrules    map[string]string
	CustomElements   map[string]int
	CustomOperations map[string]rune
	Url              Cache_Url
}

type Cache_Prefix struct {
	Atrules    map[string]map[string]string            `json:"atrules"`
	Attributes map[string]map[string]string            `json:"attributes"`
	Pseudos    map[string]map[string]string            `json:"pseudos"`
	Classes    map[string]map[string]string            `json:"classes"`
	Elements   map[string]map[string]string            `json:"elements"`
	Values     map[string]map[string]map[string]string `json:"values"`
}

type Cache_Static struct {
	WATCH           bool
	DEBUG           bool
	Command         string
	Argument        string
	RootCSS         string
	RootPath        string
	WorkPath        string
	ProjectName     string
	ProjectVersion  string
	Vendors         []string
	ProxyMap        []Config_ProxyMap
	Tweaks          Config_Tweaks
	Hashrule        map[string]string
	Artifacts_Saved map[string]string
	Libraries_Saved map[string]string
	Targetdir_Saved map[string]Config_ProxyStorage
	Archive         Config_Archive
}

type Cache_Delta_Report struct {
	Artifacts string
	Libraries string
	Archives  string
	Constants string
	Hashrule  string
	Errors    string
	MemChart  string
	Footer    string
}

type Cache_Delta_Lookup struct {
	Libraries map[string]File_Lookup
	Artifacts map[string]File_Lookup
	Archives  map[string]File_Lookup
}

type Cache_Delta_Errors struct {
	Artifacts []string
	Libraries []string
	Archives  []string
	Multiples []string
}

type Cache_Delta_Diagnostics struct {
	Multiples []Support_Diagnostic
	Artifacts []Support_Diagnostic
	Libraries []Support_Diagnostic
	Archives  []Support_Diagnostic
}

type Cache_Delta struct {
	DeltaPath    string
	DeltaContent string
	PublishError string
	FinalMessage string
	ErrorCount   int
	Report       Cache_Delta_Report
	Lookup       Cache_Delta_Lookup
	Errors       Cache_Delta_Errors
	Diagnostics  Cache_Delta_Diagnostics
}

type Cache_Manifest struct {
	Constants  []string
	Hashrule   map[string]string
	Filelookup map[string]File_Lookup
	AXIOM      map[string]File_ClassMetaMap
	CLUSTER    map[string]File_ClassMetaMap
	LOCAL      map[string]File_ClassMetaMap
	GLOBAL     map[string]File_ClassMetaMap
	ARTIFACT   map[string]File_ClassMetaMap
	Errors     []Support_Diagnostic
}

type Cache_Class struct {
	Hashrule        map[string]string
	Index_to_Data   map[int]Style_ClassData
	Global___Index  Style_ClassIndexMap
	Public___Index  Style_ClassIndexMap
	Library__Index  Style_ClassIndexMap
	Artifact_Index  Style_ClassIndexMap
	ClassDictionary Style_Dictionary
	PublishIndexMap []Style_ClassIndexTrace
}

type Cache_Files struct {
	LIBRARIES map[string]File_Storage
	ARTIFACTS map[string]File_Storage
	TARGETDIR map[string]Script_Target
}
