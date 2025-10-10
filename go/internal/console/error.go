package console

import (
	_model "main/models"
	S "main/package/console"
	O "main/package/object"
)

func Error_Hashrule(
	primitive string,
	cause string,
	source string,
	message string,
	preview *O.T[string, string],
) error_return {
	preview.Set("ERROR BY", S.Format(cause, S.Preset.None, S.Style.AS_Bold, S.Style.TC_Normal_Red))
	var errstring = S.Tag.Li(S.Format(source, S.Preset.Tertiary), S.Preset.Failed, S.Style.AS_Bold) + "\n " + S.Tag.Tab(1, S.Preset.None) + S.MAKE(
		S.Format(primitive, S.Preset.Primary)+" : "+S.Format(message, S.Preset.Failed),
		List_Props(preview, S.Preset.Primary, S.Preset.Tertiary),
		S.MakeList{TypeFunc: S.List.Waterfall, Intent: 1, Preset: S.Preset.Primary},
	)

	preview.Set("ERROR BY", cause)
	var diagnostic = _model.Refer_Diagnostic{
		Message: S.MAKE(
			primitive+" : "+message,
			List_Props(preview, S.Preset.None, S.Preset.None),
			S.MakeList{TypeFunc: S.List.Waterfall, Intent: 1, Preset: S.Preset.None},
		),
		Sources: []string{source},
	}

	return error_return{
		Errorstring: errstring,
		Diagnostic:  diagnostic,
	}
}

type error_return struct {
	Errorstring string
	Diagnostic  _model.Refer_Diagnostic
}

func Error_Standard(
	message string,
	declaration []string,
) error_return {
	errorstring := S.MAKE(
		S.Tag.Li(message, S.Preset.Failed),
		declaration,
		S.MakeList{TypeFunc: S.List.Bullets, Intent: 1, Preset: S.Preset.Tertiary},
	)
	diagnostic := _model.Refer_Diagnostic{
		Message: message,
		Sources: declaration,
	}
	return error_return{
		Errorstring: errorstring,
		Diagnostic:  diagnostic,
	}
}

func Error_Reporter(
	message_pass string,
	message_fail string,
	items []string,
) string {
	var heading string
	var itemPreset []string
	if len(items) == 0 {
		heading = S.Tag.H5(message_pass, S.Preset.Success)
		itemPreset = S.Preset.Success
	} else {
		heading = S.Tag.H5(message_fail, S.Preset.Failed)
		itemPreset = S.Preset.Failed
	}
	return S.MAKE(
		heading,
		items,
		S.MakeList{TypeFunc: S.List.Bullets, Preset: itemPreset},
	)
}
