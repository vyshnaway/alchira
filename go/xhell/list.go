package xhell

import (
	S "main/shell"
)

func List_Props(record map[string]string, keystyles []string, valstyles []string) []string {
	keys := make([]string, 0, len(record))
	values := make([]string, 0, len(record))

	for k, v := range record {
		keys = append(keys, S.Format(k, S.Preset.None, keystyles...))
		values = append(values, S.Format(v, S.Preset.None, valstyles...))
	}

	output := make([]string, len(keys))
	for i, k := range S.List.Level(keys, 0, S.Preset.None) {
		output[i] = k + ": " + S.Format(values[i], S.Preset.None, valstyles...)
	}

	return output
}

func List_Steps(heading string, steps []string) string {
	return S.MAKE(
		S.Tag.H2(heading, S.Preset.Primary),
		steps,
		S.MakeList{TypeFunc: S.List.Bullets},
	)
}

func List_Record(heading string, record map[string]string) string {
	return S.MAKE(
		S.Tag.H2(heading, S.Preset.Primary),
		List_Props(record, S.Preset.Primary, S.Preset.Text),
		S.MakeList{TypeFunc: S.List.Bullets, Preset: S.Preset.Primary},
	)
}

func List_Catalog(heading string, items []string) string {
	return S.MAKE(
		S.Tag.H2(heading, S.Preset.Primary),
		items,
		S.MakeList{TypeFunc: S.List.Catalog},
	)
}

func List_Chart(heading string, items map[string][]string) string {
	if len(items) > 0 {
		sections := []string{}
		for head, entries := range items {
			sections = append(sections, S.MAKE(
				S.Tag.H6(head, S.Preset.Tertiary),
				entries,
				S.MakeList{TypeFunc: S.List.Catalog, Preset: S.Preset.Text},
			))
		}
		return S.MAKE(
			S.Tag.H2(heading, S.Preset.Primary),
			sections,
		)
	}
	return ""
}
