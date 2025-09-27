package compose

import (
	_slices_ "slices"
)

var vendor_Refer = struct {
	Atrules    map[string]map[string]string
	Attributes map[string]map[string]string
	Pseudos    map[string]map[string]string
	Classes    map[string]map[string]string
	Elements   map[string]map[string]string
	Values     map[string]map[string]map[string]string
}{
	Atrules:    map[string]map[string]string{},
	Attributes: map[string]map[string]string{},
	Pseudos:    map[string]map[string]string{},
	Classes:    map[string]map[string]string{},
	Elements:   map[string]map[string]string{},
	Values:     map[string]map[string]map[string]string{},
}

var vendor_Providers = []string{}


func collectStringTypeKeys(object any)[]string {
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

func Vendor_Save(
	atrules map[string]map[string]string,
	attributes map[string]map[string]string,
	pseudos map[string]map[string]string,
	classes map[string]map[string]string,
	elements map[string]map[string]string,
	values map[string]map[string]map[string]string,
) {
	vendor_Refer.Atrules = atrules
	vendor_Refer.Attributes = attributes
	vendor_Refer.Pseudos = pseudos
	vendor_Refer.Classes = classes
	vendor_Refer.Elements = elements
	vendor_Refer.Values = values

	collected := []string{}
	collected = append(collected, collectStringTypeKeys(atrules)...)
	collected = append(collected, collectStringTypeKeys(attributes)...)
	collected = append(collected, collectStringTypeKeys(pseudos)...)
	collected = append(collected, collectStringTypeKeys(classes)...)
	collected = append(collected, collectStringTypeKeys(elements)...)
	collected = append(collected, collectStringTypeKeys(values)...)

	vendor_Providers = []string{}
	for _, v := range collected {
		if !_slices_.Contains(vendor_Providers, v) {
			vendor_Providers = append(vendor_Providers, v)
		}
	}
}
