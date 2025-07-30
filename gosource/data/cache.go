package data

// APP defines the main application configuration.
var APP = T_APP{
	Name:         "",
	Version:      "",
	Website:      "",
	Command:      "",
	PortablesCdn: "",
	Cdn:          "https://xcdn.xpktr.com/xcss/",
	Worker:       "https://workers.xpktr.com/api/xcss-build-request",
	Console:      "https://console.xpktr.com/",
	Vendors:      []string{},
	CommandList: T_AppCommandList{
		Init:    "Initiate or Update & Verify setup.",
		Watch:   "Live build for developer environment",
		Preview: "Test build. Pass test for \"publish\" command.",
		Publish: "Optimized build, uses web-api.",
	},
	DefaultTweaks: T_AppDefaultTweaks{
		OpenXtyles: true,
		RapidSense: true,
		Shorthands: true,
	},
	CustomTag: T_AppCustomTag{
		Style:      "xtyle",
		Stylesheet: "xtylesheet",
		Snippet:    "xnippet",
	},
}

// TWEAKS defines the current tweaks, initialized from APP.DefaultTweaks.
var TWEAKS = APP.DefaultTweaks

// NAV defines navigation-related paths and folders.
var NAV = struct {
	Blueprint T_NavBlueprint
	Folder    T_NavFolder
	CSS       T_NavCSS
	JSON      T_NavJSON
	MD        T_NavMD
	File      NavFile
}{
	Blueprint: T_NavBlueprint{
		Scaffold:  "blueprint/scaffold",
		Libraries: "blueprint/libraries",
		Vendors:   "blueprint/vendors",
	},
	Folder: T_NavFolder{
		Setup:     "xtyles",
		Autogen:   "xtyles/autogen",
		Library:   "xtyles/library",
		Portables: "xtyles/portables",
		Mybundles: "xtyles/autogen/portable",
	},
	CSS: T_NavCSS{
		Atrules:   "xtyles/#at-rules.css",
		Constants: "xtyles/#constants.css",
		Elements:  "xtyles/#elements.css",
		Extends:   "xtyles/#extends.css",
	},
	JSON: T_NavJSON{
		Configure: "xtyles/configure.jsonc",
		Hashrules: "xtyles/hashrules.jsonc",
		Manifest:  "xtyles/autogen/manifest.json",
	},
	MD: T_NavMD{
		Instructions: "xtyles/instructions.md",
		Readme:       "xtyles/readme.md",
	},
	File: NavFile{
		ManifestIgnore: "xtyles/autogen/.gitignore",
	},
}

// ROOT defines root-level documentation and agreement paths.
var ROOT = T_ROOT{
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

// PUBLISH defines publishing-related data.
var PUBLISH = T_PUBLISH{
	DeltaPath:    "",
	DeltaContent: "",
	FinalMessage: "",
	FinalError:   "",
	ErrorCount:   0,
	WarningCount: 0,
	Report: T_PublishReport{
		Library:   "",
		Variables: "",
		Hashrule:  "",
		Targets:   "",
		Errors:    "",
		MemChart:  "",
		Footer:    "",
	},
	Manifest: T_PublishManifest{
		Prefix:    "",
		Constants: []any{},
		Hashrules: map[string]any{},
		File:      map[string]any{},
		Local:     map[string]any{},
		Global:    map[string]any{},
		Axiom:     map[string]any{},
		Cluster:   map[string]any{},
		Xtyling:   map[string]any{},
		Binding:   map[string]any{},
	},
	LibFilesTemp: map[string]any{},
}

// CACHE defines caching-related data.
var CACHE = T_CACHE{
	HashRule:            map[string]any{},
	SortedIndexes:       []any{},
	PortableEssentials:  []any{},
	Index2StylesObject:  map[string]any{},
	NativeStyle2Index:   map[string]any{},
	LibraryStyle2Index:  map[string]any{},
	GlobalsStyle2Index:  map[string]any{},
	PortableStyle2Index: map[string]any{},
	FinalStack:          map[string]any{},
}

// STACK defines stack-related data.
var STACK = T_STACK{
	Proxycache: map[string]any{},
	Libraries:  map[string]any{},
	Portables:  map[string]any{},
}

// RAW defines raw configuration data.
var RAW = T_RAW{
	Watch:         false,
	Package:       "",
	Version:       "",
	Cmd:           "",
	Arg:           "",
	ReadMe:        "",
	CSSIndex:      "",
	RootPath:      "",
	WorkPath:      "",
	Hashrule:      map[string]any{},
	Proxymap:      map[string]any{},
	Libraries:     map[string]any{},
	Portables:     map[string]any{},
	Proxyfiles:    map[string]any{},
	Portableframe: map[string]any{},
	Dependencies:  map[string]any{},
}

// PREFIX defines prefix-related data.
var PREFIX = T_PREFIX{
	AtRule:     map[string]any{},
	Pseudos:    map[string]any{},
	Attributes: map[string]any{},
	Values:     map[string]any{},
}
