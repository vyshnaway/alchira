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
	RebuildInterval int
	PollingInterval int
	WaitingInterval int
	Commands        map[string]string
	CustomAtrules   map[string]string
	CustomTags      map[string]int
	CustomOps       map[string]rune
	Url             Cache_Url
	Tweaks          Config_Tweaks
}

type Cache_Static struct {
	WATCH           bool
	DEBUG           bool
	MINIFY          bool
	SERVER          bool
	EXPORT          bool
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
	Artifacts map[string]*File_Lookup
	Libraries map[string]*File_Lookup
	TargetDir map[string]*File_Lookup
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
	Context *File_Stash
	SrcData *Style_ClassData
}

type Cache_Style struct {
	Index_Now       int
	Index_Bin       map[int]bool
	Index_Data      map[int]*Cache_SymclassData
	Global___Index  Style_ClassIndexMap
	Public___Index  Style_ClassIndexMap
	Library__Index  Style_ClassIndexMap
	Artifact_Index  Style_ClassIndexMap
	ClassDictionary Style_Dictionary
	PublishIndexMap [][]Style_ClassIndexTrace
	Hashrules       map[string]string
}

type Cache_Manifest_Groups struct {
	Axiom    map[string]Style_ClassIndexMap `json:"axiom"`
	Cluster  map[string]Style_ClassIndexMap `json:"cluster"`
	Local    map[string]Style_ClassIndexMap `json:"local"`
	Global   map[string]Style_ClassIndexMap `json:"global"`
	Artifact map[string]Style_ClassIndexMap `json:"artifact"`
}

type Cache_Manifest struct {
	Constants   map[string]string       `json:"constants"`
	Lookup      map[string]*File_Lookup `json:"lookup"`
	Group       Cache_Manifest_Groups   `json:"group"`
	Diagnostics []*File_Diagnostic      `json:"diagnostics"`
}
