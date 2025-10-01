package types

type Script_Action int

const (
	Script_Action_Read Script_Action = iota
	Script_Action_Sync
	Script_Action_Watch
	Script_Action_Monitor
)

type Script_RawStyle struct {
	Elid       int
	Element    string
	Elvalue    string
	TagCount   int
	RowIndex   int
	ColIndex   int
	EndMarker  int
	SymClasses []string
	Scope      Style_Type
	Comments   []string
	Innertext  string
	Styles     map[string]string
	Attributes map[string]string
}
