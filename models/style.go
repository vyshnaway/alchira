package models

import (
	_css "main/package/css"
)

type Style_Type string

const (
	Style_Type_Null     Style_Type = ""
	Style_Type_Local    Style_Type = "LOCAL"
	Style_Type_Global   Style_Type = "GLOBAL"
	Style_Type_Public   Style_Type = "PUBLIC"
	Style_Type_Library  Style_Type = "LIBRARY"
	Style_Type_Archive  Style_Type = "ARCHIVE"
	Style_Type_Arctach  Style_Type = "ARCTACH"
	Style_Type_Artifact Style_Type = "ARTIFACT"
)

type Style_ExportStyle struct {
	Element     string
	SymClass    string
	InnerText   string
	Stylesheet  map[string]string
	Attributes  map[string]string
	Attachments map[string]bool
}

type Style_Metadata struct {
	Info         []string          `json:"info,omitempty"`
	Skeleton     any               `json:"skeleton,omitempty"`
	Declarations []string          `json:"declarations,omitempty"`
	Variables    map[string]string `json:"variables,omitempty"`
}

type Style_ClassData struct {
	Attributes        map[string]string
	Index             int
	Metadata          *Style_Metadata
	Artifact          string
	Definent          string
	SymClass          string
	DebugClass        string
	Attachments       map[string]bool
	NativeStaple      string
	ExportStaple      string
	SummonSnippet     string
	NativeRawStyle    *_css.T_Block
	ExportRawStyle    *_css.T_Block
	NativeAttachStyle *_css.T_Block
	ExportAttachStyle *_css.T_Block
}

type Style_Dictionary map[string]map[int]string

type Style_ClassIndexMap map[string]int

type T_RawStyle struct {
	Elid       int
	Element    string
	Elvalue    string
	TagCount   int
	Start      T_Position
	End        T_Position
	EndMarker  int
	SymClasses []string
	Scope      Style_Type
	Comments   []string
	Innertext  string
	Styles     map[string]string
	Attributes map[string]string
}
