package xhell

import (
	S "main/shell"
	_types_ "main/types"
)

type error_return struct {
	Errorstring string
	Diagnostic  _types_.Refer_Diagnostic
}

func Error_Write(
	message string,
	declaration []string,
) error_return {
	errorstring := S.MAKE(
		S.Tag.Li(message, S.Preset.Warning),
		declaration,
		S.TList{TypeFunc: S.List.Bullets, Intent: 1, Preset: S.Preset.Tertiary},
	)
	diagnostic := _types_.Refer_Diagnostic{
		Message: message,
		Sources: declaration,
	}
	return error_return{
		Errorstring: errorstring,
		Diagnostic:  diagnostic,
	}
}

func Error_Report(
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
		S.TList{TypeFunc: S.List.Bullets, Preset: itemPreset},
	)
}
