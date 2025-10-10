package css

import (
	_util "main/package/utils"
	_maps "maps"
	_slices "slices"
)

type T_Vendor_Table struct {
	Atrules    map[string]map[string]string            `json:"atrules"`
	Attributes map[string]map[string]string            `json:"attributes"`
	Pseudos    map[string]map[string]string            `json:"pseudos"`
	Classes    map[string]map[string]string            `json:"classes"`
	Elements   map[string]map[string]string            `json:"elements"`
	Values     map[string]map[string]map[string]string `json:"values"`
}

var Vendor_Refer = T_Vendor_Table{
	Atrules:    map[string]map[string]string{},
	Attributes: map[string]map[string]string{},
	Pseudos:    map[string]map[string]string{},
	Classes:    map[string]map[string]string{},
	Elements:   map[string]map[string]string{},
	Values:     map[string]map[string]map[string]string{},
}

var vendor_Providers = []string{}

func Vendor_Save(table T_Vendor_Table) {

	if table.Values == nil {
		Vendor_Refer.Values = map[string]map[string]map[string]string{}
	} else {
		Vendor_Refer.Values = table.Values
	}

	if table.Atrules == nil {
		Vendor_Refer.Atrules = map[string]map[string]string{}
	} else {
		Vendor_Refer.Atrules = table.Atrules
	}

	if table.Attributes == nil {
		Vendor_Refer.Attributes = map[string]map[string]string{}
	} else {
		Vendor_Refer.Attributes = table.Attributes
	}

	if table.Elements == nil {
		Vendor_Refer.Elements = map[string]map[string]string{}
	} else {
		Vendor_Refer.Elements = table.Elements
	}

	if table.Classes == nil {
		Vendor_Refer.Classes = map[string]map[string]string{}
	} else {
		Vendor_Refer.Classes = table.Classes
	}

	if table.Pseudos == nil {
		Vendor_Refer.Pseudos = map[string]map[string]string{}
	} else {
		Vendor_Refer.Pseudos = table.Pseudos
	}

	_maps.Copy(Vendor_Refer.Pseudos, Vendor_Refer.Elements)
	_maps.Copy(Vendor_Refer.Pseudos, Vendor_Refer.Pseudos)

	collected := []string{}
	collected = append(collected, _util.Map_CollectKeyStrings(table.Atrules)...)
	collected = append(collected, _util.Map_CollectKeyStrings(table.Attributes)...)
	collected = append(collected, _util.Map_CollectKeyStrings(table.Pseudos)...)
	collected = append(collected, _util.Map_CollectKeyStrings(table.Classes)...)
	collected = append(collected, _util.Map_CollectKeyStrings(table.Elements)...)
	collected = append(collected, _util.Map_CollectKeyStrings(table.Atrules)...)

	vendor_Providers = []string{}
	for _, v := range collected {
		if !_slices.Contains(vendor_Providers, v) {
			vendor_Providers = append(vendor_Providers, v)
		}
	}
}
