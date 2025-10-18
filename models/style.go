package models

import (
	css "main/package/css"
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
	Attachments []string
}

type Style_Metadata struct {
	Info          []string          `json:"info,omitempty"`
	Skeleton      any               `json:"skeleton,omitempty"`
	Declarations  []string          `json:"declarations,omitempty"`
	Variables     map[string]string `json:"variables,omitempty"`
	SummonSnippet string            `json:"summon,omitempty"`
}

type Style_ClassData struct {
	Attributes           map[string]string
	Index                int
	Metadata             *Style_Metadata
	Artifact             string
	Definent             string
	SymClass             string
	DebugClass           string
	Attachments          []string
	XcaffoldDeclarations []string
	NativeStyle          *css.T_Block
	StapleSnippet        string
	StyleSnippet         *css.T_Block
}

type Style_Dictionary map[string]map[int]string

type Style_ClassIndexMap map[string]int

type Style_ClassIndexTrace struct {
	ClassName  string
	ClassIndex int
}
