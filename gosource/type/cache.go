package types

type Cache_Root struct {
	Bin              string
	Name             string
	Version          string
	Vendors          []string
	Extension        string
	Scripts          map[string]string
	Commands         map[string]string
	Tweaks           Config_Tweaks
	CustomAtrules    map[string]string
	CustomElements   map[string]int
	CustomOperations map[string]string
	Url              struct {
		Cdn       string
		Site      string
		Worker    string
		Console   string
		Prefixes  string
		Artifacts string
	}
}

type Cache_Prefix struct {
	Atrules    map[string]map[string]string            `json:"atrules"`
	Attributes map[string]map[string]string            `json:"attributes"`
	Pseudos    map[string]map[string]string            `json:"pseudos"`
	Classes    map[string]map[string]string            `json:"classes"`
	Elements   map[string]map[string]string            `json:"elements"`
	Values     map[string]map[string]map[string]string `json:"values"`
}

type Cache_Delta struct {
	DeltaPath    string
	DeltaContent string
	PublishError string
	FinalMessage string
	ErrorCount   int
	Report       struct {
		artifacts string
		libraries string
		archives  string
		constants string
		hashrule  string
		errors    string
		memChart  string
		footer    string
	}
	Lookup struct {
		artifacts map[string]File_Lookup
		libraries map[string]File_Lookup
		archives  map[string]File_Lookup
	}
	Errors struct {
		artifacts []string
		libraries []string
		archives  []string
		multiples []string
	}
	Diagnostics struct {
		multiples []Support_Diagnostic
		artifacts []Support_Diagnostic
		libraries []Support_Diagnostic
		archives  []Support_Diagnostic
	}
}

type Cache_Manifest struct {
	constants  []string
	hashrules  map[string]string
	filelookup map[string]File_Lookup
	AXIOM      map[string]File_ClassMetaMap
	CLUSTER    map[string]File_ClassMetaMap
	LOCAL      map[string]File_ClassMetaMap
	GLOBAL     map[string]File_ClassMetaMap
	ARTIFACT   map[string]File_ClassMetaMap
	errors     []Support_Diagnostic
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
	Archive         Config_Archive
	ProxyMap        []Config_ProxyMap
	Tweaks          Config_Tweaks
	Prefix          Cache_Prefix
	Hashrule        map[string]string
	Artifacts_Saved map[string]string
	Libraries_Saved map[string]string
	Targetdir_Saved map[string]Config_ProxyStorage
}

type Cache_Class struct {
	Hashrule             map[string]string
	Index_to_Data        map[string]Style_Classdata
	Global___Index       Style_ClassIndexMap
	Public___Index       Style_ClassIndexMap
	Library__Index       Style_ClassIndexMap
	Artifact_Index       Style_ClassIndexMap
	Sync_ClassDictionary Style_Dictionary
	Sync_PublishIndexMap Style_ClassIndexTrace
}

type Cache_Files struct {
	LIBRARIES map[string]File_Storage
	ARTIFACTS map[string]File_Storage
	TARGETDIR map[string]Script_Target
}
