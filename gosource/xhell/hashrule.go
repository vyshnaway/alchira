package xhell

import (
	S "main/shell"
	_types_ "main/types"
)

func Hashrule_Error(
	primitive string,
	cause string,
	source string,
	message string,
	preview map[string]string,
) (
	Errorstring string,
	Diagnostic _types_.Support_Diagnostic,
) {
	preview["ERROR BY"] = S.Format(cause, S.Preset.None, S.Style.AS_Bold, S.Style.TC_Normal_Red)
	var errstring = S.Tag.Li(S.Format(source, S.Preset.Tertiary), S.Preset.Failed, S.Style.AS_Bold) + "\n " + S.Tag.Tab(1, S.Preset.None) + S.MAKE(
		S.Format(primitive, S.Preset.Primary)+" : "+S.Format(message, S.Preset.Failed),
		List_Props(preview, S.Preset.Primary, S.Preset.Tertiary),
		S.TList{TypeFunc: S.List.Waterfall, Intent: 1, Preset: S.Preset.Primary},
	)

	preview["ERROR BY"] = cause
	var diagnostic = _types_.Support_Diagnostic{
		Message: S.MAKE(
			primitive+" : "+message,
			List_Props(preview, S.Preset.None, S.Preset.None),
			S.TList{TypeFunc: S.List.Waterfall, Intent: 1, Preset: S.Preset.None},
		),
		Sources: []string{source},
	}

	return errstring, diagnostic
}

func Hashrule_Report(
	hashrule map[string]string,
	errors []string,
) string {
	errorsections := []string{}
	if len(errors) > 0 {
		errorsections = []string{S.MAKE(S.Tag.H4("Invalid Hashrule", S.Preset.Failed), errors)}
	}
	return S.MAKE(List_Record("Active Hashrule", hashrule), errorsections)
}
