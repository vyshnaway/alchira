package cache

// AppCommandList defines the structure for commandList in APP.
type AppCommandList struct {
	Init    string
	Watch   string
	Preview string
	Publish string
}

// AppDefaultTweaks defines the structure for defaultTweaks in APP.
type AppDefaultTweaks struct {
	OpenXtyles bool
	RapidSense bool
	Shorthands bool
}

// AppCustomTag defines the structure for customTag in APP.
type AppCustomTag struct {
	Style      string
	Stylesheet string
	Snippet    string
}

// APP defines the main application configuration.
var APP = struct {
	Name          string
	Version       string
	Website       string
	Command       string
	PortablesCdn  string
	Cdn           string
	Worker        string
	Console       string
	CommandList   AppCommandList
	DefaultTweaks AppDefaultTweaks
	Vendors       []string
	CustomTag     AppCustomTag
}{
	Name:         "",
	Version:      "",
	Website:      "",
	Command:      "",
	PortablesCdn: "",
	Cdn:          "https://xcdn.xpktr.com/xcss/",
	Worker:       "https://workers.xpktr.com/api/xcss-build-request",
	Console:      "https://console.xpktr.com/",
	CommandList: AppCommandList{
		Init:    "Initiate or Update & Verify setup.",
		Watch:   "Live build for developer environment",
		Preview: "Test build. Pass test for \"publish\" command.",
		Publish: "Optimized build, uses web-api.",
	},
	DefaultTweaks: AppDefaultTweaks{
		OpenXtyles: true,
		RapidSense: true,
		Shorthands: true,
	},
	Vendors: []string{},
	CustomTag: AppCustomTag{
		Style:      "xtyle",
		Stylesheet: "xtylesheet",
		Snippet:    "xnippet",
	},
}

// TWEAKS defines the current tweaks, initialized from APP.DefaultTweaks.
var TWEAKS = APP.DefaultTweaks

// NavBlueprint defines the structure for blueprint in NAV.
type NavBlueprint struct {
	Scaffold  string
	Libraries string
	Vendors   string
}

// NavFolder defines the structure for folder in NAV.
type NavFolder struct {
	Setup     string
	Autogen   string
	Library   string
	Portables string
	Mybundles string
}

// NavCSS defines the structure for css in NAV.
type NavCSS struct {
	Atrules   string
	Constants string
	Elements  string
	Extends   string
}

// NavJSON defines the structure for json in NAV.
type NavJSON struct {
	Configure string
	Hashrules string
	Manifest  string
}

// NavMD defines the structure for md in NAV.
type NavMD struct {
	Instructions string
	Readme       string
}

// NavFile defines the structure for file in NAV.
type NavFile struct {
	ManifestIgnore string
}

// NAV defines navigation-related paths and folders.
var NAV = struct {
	Blueprint NavBlueprint
	Folder    NavFolder
	CSS       NavCSS
	JSON      NavJSON
	MD        NavMD
	File      NavFile
}{
	Blueprint: NavBlueprint{
		Scaffold:  "blueprint/scaffold",
		Libraries: "blueprint/libraries",
		Vendors:   "blueprint/vendors",
	},
	Folder: NavFolder{
		Setup:     "xtyles",
		Autogen:   "xtyles/autogen",
		Library:   "xtyles/library",
		Portables: "xtyles/portables",
		Mybundles: "xtyles/autogen/portable",
	},
	CSS: NavCSS{
		Atrules:   "xtyles/#at-rules.css",
		Constants: "xtyles/#constants.css",
		Elements:  "xtyles/#elements.css",
		Extends:   "xtyles/#extends.css",
	},
	JSON: NavJSON{
		Configure: "xtyles/configure.jsonc",
		Hashrules: "xtyles/hashrules.jsonc",
		Manifest:  "xtyles/autogen/manifest.json",
	},
	MD: NavMD{
		Instructions: "xtyles/instructions.md",
		Readme:       "xtyles/readme.md",
	},
	File: NavFile{
		ManifestIgnore: "xtyles/autogen/.gitignore",
	},
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
	URL  string
	Path string
}

// ROOT defines root-level documentation and agreement paths.
var ROOT = struct {
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
}{
	Docs: struct {
		Readme    RootDocItem
		Alerts    RootDocItem
		Changelog RootDocItem
	}{
		Readme:    RootDocItem{Title: "README", URL: "readme.md", Path: "readme.md"},
		Alerts:    RootDocItem{Title: "ALERTS", URL: "alerts.md", Path: "alerts.md"},
		Changelog: RootDocItem{Title: "ALERTS", URL: "changelog.md", Path: "changelog.md"},
	},
	Agreement: struct {
		License RootAgreementItem
		Terms   RootAgreementItem
		Privacy RootAgreementItem
	}{
		License: RootAgreementItem{Title: "LICENSE", URL: "agreements-txt/license.txt", Path: "agreements/license.txt"},
		Terms:   RootAgreementItem{Title: "TERMS & CONDITIONS", URL: "agreements-txt/terms.txt", Path: "agreements/terms.txt"},
		Privacy: RootAgreementItem{Title: "PRIVACY POLICY", URL: "agreements-txt/privacy.txt", Path: "agreements/privacy.txt"},
	},
	Vendor: struct {
		Attributes RootVendorItem
		Values     RootVendorItem
		Atrules    RootVendorItem
		Classes    RootVendorItem
		Elements   RootVendorItem
	}{
		Attributes: RootVendorItem{Title: "Attributes Prefixes", URL: "attributes.json", Path: "attributes.json"},
		Values:     RootVendorItem{Title: "Values Prefixes", URL: "values.json", Path: "values.json"},
		Atrules:    RootVendorItem{Title: "Atrules Prefixes", URL: "atrules.json", Path: "atrules.json"},
		Classes:    RootVendorItem{Title: "Classes Prefixes", URL: "classes.json", Path: "classes.json"},
		Elements:   RootVendorItem{Title: "Elements Prefixes", URL: "elements.json", Path: "elements.json"},
	},
}

// PublishReport defines the structure for Report in PUBLISH.
type PublishReport struct {
	Library   string
	Variables string
	Hashrule  string
	Targets   string
	Errors    string
	MemChart  string
	Footer    string
}

// PublishManifest defines the structure for MANIFEST in PUBLISH.
type PublishManifest struct {
	Prefix    string
	Constants []interface{} // Using interface{} as type not specified in JS
	Hashrules map[string]interface{}
	File      map[string]interface{}
	Local     map[string]interface{}
	Global    map[string]interface{}
	Axiom     map[string]interface{}
	Cluster   map[string]interface{}
	Xtyling   map[string]interface{}
	Binding   map[string]interface{}
}

// PUBLISH defines publishing-related data.
var PUBLISH = struct {
	DeltaPath    string
	DeltaContent string
	FinalMessage string
	FinalError   string
	ErrorCount   int
	WarningCount int
	Report       PublishReport
	Manifest     PublishManifest
	LibFilesTemp map[string]interface{}
}{
	DeltaPath:    "",
	DeltaContent: "",
	FinalMessage: "",
	FinalError:   "",
	ErrorCount:   0,
	WarningCount: 0,
	Report: PublishReport{
		Library:   "",
		Variables: "",
		Hashrule:  "",
		Targets:   "",
		Errors:    "",
		MemChart:  "",
		Footer:    "",
	},
	Manifest: PublishManifest{
		Prefix:    "",
		Constants: []interface{}{},
		Hashrules: map[string]interface{}{},
		File:      map[string]interface{}{},
		Local:     map[string]interface{}{},
		Global:    map[string]interface{}{},
		Axiom:     map[string]interface{}{},
		Cluster:   map[string]interface{}{},
		Xtyling:   map[string]interface{}{},
		Binding:   map[string]interface{}{},
	},
	LibFilesTemp: map[string]interface{}{},
}

// CACHE defines caching-related data.
var CACHE = struct {
	HashRule            map[string]interface{}
	SortedIndexes       []interface{}
	PortableEssentials  []interface{}
	Index2StylesObject  map[string]interface{}
	NativeStyle2Index   map[string]interface{}
	LibraryStyle2Index  map[string]interface{}
	GlobalsStyle2Index  map[string]interface{}
	PortableStyle2Index map[string]interface{}
	FinalStack          map[string]interface{}
}{
	HashRule:            map[string]interface{}{},
	SortedIndexes:       []interface{}{},
	PortableEssentials:  []interface{}{},
	Index2StylesObject:  map[string]interface{}{},
	NativeStyle2Index:   map[string]interface{}{},
	LibraryStyle2Index:  map[string]interface{}{},
	GlobalsStyle2Index:  map[string]interface{}{},
	PortableStyle2Index: map[string]interface{}{},
	FinalStack:          map[string]interface{}{},
}

// STACK defines stack-related data.
var STACK = struct {
	Proxycache map[string]interface{}
	Libraries  map[string]interface{}
	Portables  map[string]interface{}
}{
	Proxycache: map[string]interface{}{},
	Libraries:  map[string]interface{}{},
	Portables:  map[string]interface{}{},
}

// RAW defines raw configuration data.
var RAW = struct {
	Watch         bool
	Package       string
	Version       string
	Cmd           string
	Arg           string
	ReadMe        string
	CSSIndex      string
	RootPath      string
	WorkPath      string
	Hashrule      map[string]interface{}
	Proxymap      map[string]interface{}
	Libraries     map[string]interface{}
	Portables     map[string]interface{}
	Proxyfiles    map[string]interface{}
	Portableframe map[string]interface{}
	Dependencies  map[string]interface{}
}{
	Watch:         false,
	Package:       "",
	Version:       "",
	Cmd:           "",
	Arg:           "",
	ReadMe:        "",
	CSSIndex:      "",
	RootPath:      "",
	WorkPath:      "",
	Hashrule:      map[string]interface{}{},
	Proxymap:      map[string]interface{}{},
	Libraries:     map[string]interface{}{},
	Portables:     map[string]interface{}{},
	Proxyfiles:    map[string]interface{}{},
	Portableframe: map[string]interface{}{},
	Dependencies:  map[string]interface{}{},
}

// PREFIX defines prefix-related data.
var PREFIX = struct {
	AtRule     map[string]interface{}
	Pseudos    map[string]interface{}
	Attributes map[string]interface{}
	Values     map[string]interface{}
}{
	AtRule:     map[string]interface{}{},
	Pseudos:    map[string]interface{}{},
	Attributes: map[string]interface{}{},
	Values:     map[string]interface{}{},
}
