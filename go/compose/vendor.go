package compose

import (
	"maps"
	_slices_ "slices"
)

type Type_VendorTable struct {
	Atrules    map[string]map[string]string            `json:"atrules"`
	Attributes map[string]map[string]string            `json:"attributes"`
	Pseudos    map[string]map[string]string            `json:"pseudos"`
	Classes    map[string]map[string]string            `json:"classes"`
	Elements   map[string]map[string]string            `json:"elements"`
	Values     map[string]map[string]map[string]string `json:"values"`
}

var Vendor_Refer = Type_VendorTable{
	Atrules:    map[string]map[string]string{},
	Attributes: map[string]map[string]string{},
	Pseudos:    map[string]map[string]string{},
	Classes:    map[string]map[string]string{},
	Elements:   map[string]map[string]string{},
	Values:     map[string]map[string]map[string]string{},
}

var vendor_Providers = []string{}

func collectStringTypeKeys(object any) []string {
	collected := []string{}
	switch obj := object.(type) {
	case map[string]string:
		for k := range obj {
			collected = append(collected, k)
		}
	case map[string]any:
		for _, inner := range obj {
			collected = append(collected, collectStringTypeKeys(inner)...)
		}
	}
	return collected
}

func Vendor_Save(table Type_VendorTable) {

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

	maps.Copy(Vendor_Refer.Pseudos, Vendor_Refer.Elements)
	maps.Copy(Vendor_Refer.Pseudos, Vendor_Refer.Pseudos)

	collected := []string{}
	collected = append(collected, collectStringTypeKeys(table.Atrules)...)
	collected = append(collected, collectStringTypeKeys(table.Attributes)...)
	collected = append(collected, collectStringTypeKeys(table.Pseudos)...)
	collected = append(collected, collectStringTypeKeys(table.Classes)...)
	collected = append(collected, collectStringTypeKeys(table.Elements)...)
	collected = append(collected, collectStringTypeKeys(table.Atrules)...)

	vendor_Providers = []string{}
	for _, v := range collected {
		if !_slices_.Contains(vendor_Providers, v) {
			vendor_Providers = append(vendor_Providers, v)
		}
	}
}
