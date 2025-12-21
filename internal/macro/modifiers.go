package macro

import (
	"main/package/utils"
	"strconv"
	"strings"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
)

var Modifiers = map[string]func(OP string, TABLE, PARAMS []string) []string{
	"SPLINE": func(OP string, TABLE, PARAMS []string) []string {
		if len(PARAMS) >= 3 {
			divident := len(TABLE)
			replacee := PARAMS[0]
			baseXout, _ := strconv.Atoi(PARAMS[1])
			decimals, _ := strconv.Atoi(PARAMS[2])
			yCoords := []float64{}
			for _, i := range PARAMS {
				ii, _ := strconv.ParseFloat(i, 64)
				yCoords = append(yCoords, ii)
			}

			outs := generateEquidistantSpline(yCoords, divident)

			for i, v := range outs {
				TABLE[i] = strings.Replace(TABLE[i], replacee, floatToBase(v, baseXout, decimals), 1)
			}
		}
		return TABLE
	},
	"INJECT": func(OP string, TABLE, PARAMS []string) []string {
		if len(PARAMS) > 1 {
			replacee := PARAMS[0]
			lastval := PARAMS[len(PARAMS)-1]
			for i, v := range PARAMS[1:] {
				if i < len(TABLE) {
					TABLE[i] = strings.Replace(TABLE[i], replacee, v, 1)
				} else {
					TABLE = append(TABLE, strings.Replace(lastval, replacee, v, 1))
				}
			}
		}
		return TABLE
	},
	"EXTEND": func(OP string, TABLE, PARAMS []string) []string {
		if len(PARAMS) >= 1 {
			newlength, _ := strconv.Atoi(PARAMS[0])
			template := TABLE[len(TABLE)-1]

			for len(TABLE) < newlength {
				TABLE = append(TABLE, template)
			}
		}
		return TABLE
	},
	"APPEND": func(OP string, TABLE, PARAMS []string) []string {
		if len(PARAMS) == 2 {
			REPLACE := PARAMS[0] + PARAMS[1]
			for INDEX, TEXT := range TABLE {
				TABLE[INDEX] = strings.Replace(TEXT, PARAMS[0], REPLACE, 1)
			}
		}
		return TABLE
	},
	"PREPEND": func(OP string, TABLE, PARAMS []string) []string {
		if len(PARAMS) == 2 {
			REPLACE := PARAMS[1] + PARAMS[0]
			for INDEX, TEXT := range TABLE {
				TABLE[INDEX] = strings.Replace(TEXT, PARAMS[0], REPLACE, 1)
			}
		}
		return TABLE
	},
	"REPLACE": func(OP string, TABLE, PARAMS []string) []string {
		if len(PARAMS) == 2 {
			for INDEX, TEXT := range TABLE {
				TABLE[INDEX] = strings.Replace(TEXT, PARAMS[0], PARAMS[1], 1)
			}
		}
		return TABLE
	},
	"UNCOMMENT": func(OP string, TABLE, PARAMS []string) []string {
		for INDEX, TEXT := range TABLE {
			TABLE[INDEX] = utils.Code_Strip(TEXT, false, false, true, false)
		}
		return TABLE
	},
	"MINIFY": func(OP string, TABLE, PARAMS []string) []string {
		for INDEX, TEXT := range TABLE {
			TABLE[INDEX] = utils.Code_Strip(TEXT, false, false, false, true)
		}
		return TABLE
	},
	"MD": func(OP string, TABLE, PARAMS []string) []string {
		extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock
		p := parser.NewWithExtensions(extensions)
		for INDEX, TEXT := range TABLE {
			doc := p.Parse([]byte(TEXT))

			// create HTML renderer with extensions
			htmlFlags := html.CommonFlags | html.HrefTargetBlank
			opts := html.RendererOptions{Flags: htmlFlags}
			renderer := html.NewRenderer(opts)

			TABLE[INDEX] = string(markdown.Render(doc, renderer))
		}
		return TABLE
	},
	"DEDENT": func(OP string, TABLE, PARAMS []string) []string {

		for INDEX, TEXT := range TABLE {
			lines := strings.Split(TEXT, "\n")

			minIndent := -1
			for _, line := range lines {
				trimmed := strings.TrimSpace(line)
				if len(trimmed) == 0 {
					continue
				}

				indent := len(line) - len(strings.TrimLeft(line, " \t"))
				if minIndent == -1 || indent < minIndent {
					minIndent = indent
				}
			}

			if minIndent <= 0 {
				return TABLE
			}

			var result []string
			for _, line := range lines {
				if len(line) >= minIndent {
					result = append(result, line[minIndent:])
				} else {
					result = append(result, strings.TrimLeft(line, " \t"))
				}
			}

			TABLE[INDEX] = strings.Join(result, "\n")
		}
		return TABLE
	},
	"": func(OP string, TABLE, PARAMS []string) []string {
		return TABLE
	},
}
