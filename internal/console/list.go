package console

import (
	S "main/package/console"
	O "main/package/object"
)

func List_Props(record *O.T[string, string], keystyles []string, valstyles []string) []string {
	keys := make([]string, 0, record.Len())
	values := make([]string, 0, record.Len())

	record.Range(func(k, v string) {
		keys = append(keys, S.Format(k, S.Preset.None, keystyles...))
		values = append(values, S.Format(v, S.Preset.None, valstyles...))
	})

	output := make([]string, len(keys))
	for i, k := range S.List.Level(keys, 0, S.Preset.None) {
		output[i] = k + ": " + S.Format(values[i], S.Preset.None, valstyles...)
	}

	return output
}

func List_Steps(heading string, steps []string) string {
	if len(steps) > 0 {
		if len(heading) > 0 {
			heading = S.Tag.H2(heading, S.Preset.Primary, S.Style.AS_Bold)
		}
		return S.MAKE(
			heading,
			steps,
			S.MakeList{TypeFunc: S.List.Numbers},
		)
	}
	return ""
}

func List_Record(heading string, record *O.T[string, string]) string {
	if record.Len() > 0 {
		if len(heading) > 0 {
			heading = S.Tag.H2(heading, S.Preset.Primary, S.Style.AS_Bold)
		}
		return S.MAKE(
			heading,
			List_Props(record, S.Preset.Primary, S.Preset.Text),
			S.MakeList{TypeFunc: S.List.Bullets, Preset: S.Preset.Primary},
		)
	}

	return ""
}

func List_Catalog(heading string, items []string) string {
	if len(items) > 0 {
		if len(heading) > 0 {
			heading = S.Tag.H2(heading, S.Preset.Primary, S.Style.AS_Bold)
		}
		return S.MAKE(
			heading,
			items,
			S.MakeList{TypeFunc: S.List.Catalog, Preset: S.Preset.Text},
		)
	}
	return ""
}

func List_Chart(heading string, items *O.T[string, []string]) string {
	counter := 0
	sections := []string{}

	items.Range(func(head string, entries []string) {
		counter += len(entries)
		sections = append(sections, S.MAKE(
			S.Tag.H6(head, S.Preset.Tertiary, S.Style.AS_Bold),
			entries,
			S.MakeList{TypeFunc: S.List.Catalog, Preset: S.Preset.Text},
		))
	})

	if counter > 0 {
		if len(heading) > 0 {
			heading = S.Tag.H2(heading, S.Preset.Primary, S.Style.AS_Bold)
			return S.MAKE(
				heading,
				sections,
			)
		}
	}

	return ""
}
