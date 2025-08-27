package root

type T_Style struct {
	AS_Bold          string
	AS_Dim           string
	AS_Italic        string
	AS_Underline     string
	AS_Blink_Slow    string
	AS_Blink_Fast    string
	AS_Reverse       string
	AS_Hidden        string
	AS_Strikethrough string
	AS_Rare          string

	AR_2Underline string
	AR_intensity  string
	AR_italic     string
	AR_underline  string
	AR_blinking   string
	AR_inverted   string
	AR_hidden     string
	AR_struck     string

	TB_Normal_Black   string
	TB_Normal_Red     string
	TB_Normal_Green   string
	TB_Normal_Yellow  string
	TB_Normal_Blue    string
	TB_Normal_Magenta string
	TB_Normal_Cyan    string
	TB_Normal_White   string
	TB_Bright_Black   string
	TB_Bright_Red     string
	TB_Bright_Green   string
	TB_Bright_Yellow  string
	TB_Bright_Blue    string
	TB_Bright_Magenta string
	TB_Bright_Cyan    string
	TB_Bright_White   string

	TC_Normal_Black   string
	TC_Normal_Red     string
	TC_Normal_Green   string
	TC_Normal_Yellow  string
	TC_Normal_Blue    string
	TC_Normal_Magenta string
	TC_Normal_Cyan    string
	TC_Normal_White   string
	TC_Bright_Black   string
	TC_Bright_Red     string
	TC_Bright_Green   string
	TC_Bright_Yellow  string
	TC_Bright_Blue    string
	TC_Bright_Magenta string
	TC_Bright_Cyan    string
	TC_Bright_White   string
}

var Style = T_Style{
	AS_Bold:          "1",
	AS_Dim:           "2",
	AS_Italic:        "3",
	AS_Underline:     "4",
	AS_Blink_Slow:    "5",
	AS_Blink_Fast:    "6",
	AS_Reverse:       "7",
	AS_Hidden:        "8",
	AS_Strikethrough: "9",
	AS_Rare:          "20",

	AR_2Underline: "21",
	AR_intensity:  "22",
	AR_italic:     "23",
	AR_underline:  "24",
	AR_blinking:   "25",
	AR_inverted:   "27",
	AR_hidden:     "28",
	AR_struck:     "29",

	TB_Normal_Black:   "40",
	TB_Normal_Red:     "41",
	TB_Normal_Green:   "42",
	TB_Normal_Yellow:  "43",
	TB_Normal_Blue:    "44",
	TB_Normal_Magenta: "45",
	TB_Normal_Cyan:    "46",
	TB_Normal_White:   "47",
	TB_Bright_Black:   "100",
	TB_Bright_Red:     "101",
	TB_Bright_Green:   "102",
	TB_Bright_Yellow:  "103",
	TB_Bright_Blue:    "104",
	TB_Bright_Magenta: "105",
	TB_Bright_Cyan:    "106",
	TB_Bright_White:   "107",

	TC_Normal_Black:   "30",
	TC_Normal_Red:     "31",
	TC_Normal_Green:   "32",
	TC_Normal_Yellow:  "33",
	TC_Normal_Blue:    "34",
	TC_Normal_Magenta: "35",
	TC_Normal_Cyan:    "36",
	TC_Normal_White:   "37",
	TC_Bright_Black:   "90",
	TC_Bright_Red:     "91",
	TC_Bright_Green:   "92",
	TC_Bright_Yellow:  "93",
	TC_Bright_Blue:    "94",
	TC_Bright_Magenta: "95",
	TC_Bright_Cyan:    "96",
	TC_Bright_White:   "97",
}
