package data

// T_AppCommandList defines the structure for commandList in APP.
type T_AppCommandList struct {
	Init    string
	Watch   string
	Preview string
	Publish string
}

// T_AppDefaultTweaks defines the structure for defaultTweaks in APP.
type T_AppDefaultTweaks struct {
	OpenXtyles bool
	RapidSense bool
	Shorthands bool
}

// T_AppCustomTag defines the structure for customTag in APP.
type T_AppCustomTag struct {
	Style      string
	Stylesheet string
	Snippet    string
}

// APP defines the main application configuration.
type T_APP = struct {
	Name          string
	Version       string
	Website       string
	Command       string
	PortablesCdn  string
	Cdn           string
	Worker        string
	Console       string
	Vendors       []string
	CommandList   T_AppCommandList
	DefaultTweaks T_AppDefaultTweaks
	CustomTag     T_AppCustomTag
}

// T_NavBlueprint defines the structure for blueprint in NAV.
type T_NavBlueprint struct {
	Scaffold  string
	Libraries string
	Vendors   string
}

// T_NavFolder defines the structure for folder in NAV.
type T_NavFolder struct {
	Setup     string
	Autogen   string
	Library   string
	Portables string
	Mybundles string
}

// T_NavCSS defines the structure for css in NAV.
type T_NavCSS struct {
	Atrules   string
	Constants string
	Elements  string
	Extends   string
}

// T_NavJSON defines the structure for json in NAV.
type T_NavJSON struct {
	Configure string
	Hashrules string
	Manifest  string
}

// T_NavMD defines the structure for md in NAV.
type T_NavMD struct {
	Instructions string
	Readme       string
}

// NavFile defines the structure for file in NAV.
type NavFile struct {
	ManifestIgnore string
}

// NAV defines navigation-related paths and folders.
type T_NAV struct {
	Blueprint T_NavBlueprint
	Folder    T_NavFolder
	CSS       T_NavCSS
	JSON      T_NavJSON
	MD        T_NavMD
	File      NavFile
}

// RootDocItem defines the structure for items in ROOT.DOCS.
type RootDocItem struct {
	Title string
	URL   string
	Path  string
}

// RootAgreementItem defines the structure for items in ROOT.AGREEMENT.
type RootAgreementItem struct {
	Title string
	URL   string
	Path  string
}

// RootVendorItem defines the structure for items in ROOT.VENDOR.
type RootVendorItem struct {
	Title string
	URL   string
	Path  string
}

// ROOT defines root-level documentation and agreement paths.
type T_ROOT struct {
	Docs struct {
		Readme    RootDocItem
		Alerts    RootDocItem
		Changelog RootDocItem
	}
	Agreement struct {
		License RootAgreementItem
		Terms   RootAgreementItem
		Privacy RootAgreementItem
	}
	Vendor struct {
		Attributes RootVendorItem
		Values     RootVendorItem
		Atrules    RootVendorItem
		Classes    RootVendorItem
		Elements   RootVendorItem
	}
}

// T_PublishReport defines the structure for Report in PUBLISH.
type T_PublishReport struct {
	Library   string
	Variables string
	Hashrule  string
	Targets   string
	Errors    string
	MemChart  string
	Footer    string
}

// T_PublishManifest defines the structure for MANIFEST in PUBLISH.
type T_PublishManifest struct {
	Prefix    string
	Constants []any
	Hashrules map[string]any
	File      map[string]any
	Local     map[string]any
	Global    map[string]any
	Axiom     map[string]any
	Cluster   map[string]any
	Xtyling   map[string]any
	Binding   map[string]any
}

// PUBLISH defines publishing-related data.
type T_PUBLISH struct {
	DeltaPath    string
	DeltaContent string
	FinalMessage string
	FinalError   string
	ErrorCount   int
	WarningCount int
	Report       T_PublishReport
	Manifest     T_PublishManifest
	LibFilesTemp map[string]any
}

// CACHE defines caching-related data.
type T_CACHE struct {
	HashRule            map[string]any
	SortedIndexes       []any
	PortableEssentials  []any
	Index2StylesObject  map[string]any
	NativeStyle2Index   map[string]any
	LibraryStyle2Index  map[string]any
	GlobalsStyle2Index  map[string]any
	PortableStyle2Index map[string]any
	FinalStack          map[string]any
}

// STACK defines stack-related data.
type T_STACK struct {
	Proxycache map[string]any
	Libraries  map[string]any
	Portables  map[string]any
}

// RAW defines raw configuration data.
type T_RAW struct {
	Watch         bool
	Package       string
	Version       string
	Cmd           string
	Arg           string
	ReadMe        string
	CSSIndex      string
	RootPath      string
	WorkPath      string
	Hashrule      map[string]any
	Proxymap      map[string]any
	Libraries     map[string]any
	Portables     map[string]any
	Proxyfiles    map[string]any
	Portableframe map[string]any
	Dependencies  map[string]any
}

// PREFIX defines prefix-related data.
type T_PREFIX struct {
	AtRule     map[string]any
	Pseudos    map[string]any
	Attributes map[string]any
	Values     map[string]any
}