package models

import (
	"main/package/watchman"
	"sync"
	"sync/atomic"
	"time"
)

type Cache_Url struct {
	Docs      string
	Site      string
	Worker    string
	Console   string
	Vendors   string
	Artifacts string
}

type Cache_Root struct {
	Name            string
	Version         string
	Extension       string
	WebsocketPort   int
	PollingInterval int
	WaitingInterval int
	Commands        map[string]string
	CustomDirective map[string]string
	CustomTags      map[string]int
	CustomOp        map[string]rune
	Url             Cache_Url
	Flavor          Compiler_Flavor
	Tweaks          Config_Tweaks
}

type Cache_Static struct {
	WATCH           bool
	DEBUG           bool
	IAMAI           bool
	MINIFY          bool
	SERVER          bool
	PREVIEW         bool
	Command         string
	Argument        string
	RootPath        string
	WorkPath        string
	ProjectName     string
	ProjectVersion  string
	CustomTags      []string
	ReplacementTags map[string]int
	Watchman        *watchman.T_Watcher
	ExecuteMutex    sync.Mutex
	RebuildFlag     atomic.Bool
	RebuildTicker   *time.Ticker
}

type Cache_Saved struct {
	RootCSS           string
	Hashrule          map[string]string
	Artifacts_Sources map[string]string
	Artifacts_Saved   map[string]string
	Libraries_Saved   map[string]string
	TargetDir_Saved   map[string]Config_ProxyStorage
	ProxyMap          []Config_ProxyMap
	Tweaks            Config_Tweaks
	Sandbox           map[string]any
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

type Cache_Delta_Lookup struct {
	Artifacts map[string]*File_CacheData
	Libraries map[string]*File_CacheData
	TargetDir map[string]*File_CacheData
}

type Cache_Delta_Diagnostics struct {
	Artifacts []*File_Diagnostic
	Axioms    []*File_Diagnostic
	Clusters  []*File_Diagnostic
	TargetDir []*File_Diagnostic
	Multiples []*File_Diagnostic
	Hashrules []*File_Diagnostic
	Handoffs  []*File_Diagnostic
}

type Cache_Delta struct {
	PublishError string
	FinalMessage string
	IndexBuild   string
	IndexAttach  map[int]bool
	Errors       []string
	Report       Cache_Delta_Report
	Lookup       Cache_Delta_Lookup
	Error        Cache_Delta_Errors
	Diagnostic   Cache_Delta_Diagnostics
}

type Cache_SymclassData struct {
	Context   *File_Stash
	SrcData   *Style_ClassData
	Dependint map[int]bool
}

type Cache_Style struct {
	Index_Now           int
	Index_Bin           map[int]bool
	Hashrules           map[string]string
	Global___Index      Style_ClassIndexMap
	Public___Index      Style_ClassIndexMap
	Library__Index      Style_ClassIndexMap
	Artifact_Index      Style_ClassIndexMap
	ClassDictionary     Style_Dictionary
	Index_to_Styledata  map[int]*Cache_SymclassData
	Filepath_to_Context map[string]*File_Stash
	Sandbox_Scattered   Style_ClassIndexMap
	Sandbox_Append      Style_ClassIndexMap
	Publish_Ordered     [][]Style_ClassIndexTrace
	Sandbox_Final       Style_ClassIndexMap
}

type Cache_Manifest_Groups struct {
	Axiom    map[string]Style_ClassIndexMap `json:"axiom"`
	Cluster  map[string]Style_ClassIndexMap `json:"cluster"`
	Local    map[string]Style_ClassIndexMap `json:"local"`
	Global   map[string]Style_ClassIndexMap `json:"global"`
	Artifact map[string]Style_ClassIndexMap `json:"artifact"`
}

type Cache_Manifest struct {
	Constants   map[string]string          `json:"constants"`
	Lookup      map[string]*File_CacheData `json:"lookup"`
	Group       Cache_Manifest_Groups      `json:"group"`
	Diagnostics []*File_Diagnostic         `json:"diagnostics"`
}
