package script

import (
	"main/package/utils"
	"strconv"
	"strings"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
)

var Modifiers = map[string]func(OP string, STASH, PARAMS []string) []string{
	"SPLINE": func(OP string, STASH, PARAMS []string) []string {
		if len(PARAMS) >= 3 {
			divident := len(STASH)
			replacee := PARAMS[0]
			baseXout, _ := strconv.Atoi(PARAMS[1])
			decimals, _ := strconv.Atoi(PARAMS[2])
			yCoords := []float64{}
			for _, i := range PARAMS {
				ii, _ := strconv.ParseFloat(i, 64)
				yCoords = append(yCoords, ii)
			}

			outs := GenerateEquidistantSpline(yCoords, divident)

			for i, v := range outs {
				STASH[i] = strings.ReplaceAll(STASH[i], replacee, FloatToBase(v, baseXout, decimals))
			}
		}
		return STASH
	},
	"APPEND": func(OP string, STASH, PARAMS []string) []string {
		if len(PARAMS) == 2 {
			REPLACE := PARAMS[0] + PARAMS[1]
			for INDEX, TEXT := range STASH {
				STASH[INDEX] = strings.ReplaceAll(TEXT, PARAMS[0], REPLACE)
			}
		}
		return STASH
	},
	"PREPEND": func(OP string, STASH, PARAMS []string) []string {
		if len(PARAMS) == 2 {
			REPLACE := PARAMS[1] + PARAMS[0]
			for INDEX, TEXT := range STASH {
				STASH[INDEX] = strings.ReplaceAll(TEXT, PARAMS[0], REPLACE)
			}
		}
		return STASH
	},
	"REPLACE": func(OP string, STASH, PARAMS []string) []string {
		if len(PARAMS) == 2 {
			for INDEX, TEXT := range STASH {
				STASH[INDEX] = strings.ReplaceAll(TEXT, PARAMS[0], PARAMS[1])
			}
		}
		return STASH
	},
	"UNCOMMENT": func(OP string, STASH, PARAMS []string) []string {
		for INDEX, TEXT := range STASH {
			STASH[INDEX] = utils.Code_Strip(TEXT, false, false, true, false)
		}
		return STASH
	},
	"MINIFY": func(OP string, STASH, PARAMS []string) []string {
		for INDEX, TEXT := range STASH {
			STASH[INDEX] = utils.Code_Strip(TEXT, false, false, false, true)
		}
		return STASH
	},
	"MD": func(OP string, STASH, PARAMS []string) []string {
		extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock
		p := parser.NewWithExtensions(extensions)
		for INDEX, TEXT := range STASH {
			doc := p.Parse([]byte(TEXT))

			// create HTML renderer with extensions
			htmlFlags := html.CommonFlags | html.HrefTargetBlank
			opts := html.RendererOptions{Flags: htmlFlags}
			renderer := html.NewRenderer(opts)

			STASH[INDEX] = string(markdown.Render(doc, renderer))
		}
		return STASH
	},
	"DEDENT": func(OP string, STASH, PARAMS []string) []string {

		for INDEX, TEXT := range STASH {
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
				return STASH
			}

			var result []string
			for _, line := range lines {
				if len(line) >= minIndent {
					result = append(result, line[minIndent:])
				} else {
					result = append(result, strings.TrimLeft(line, " \t"))
				}
			}

			STASH[INDEX] = strings.Join(result, "\n")
		}
		return STASH
	},
	"": func(OP string, STASH, PARAMS []string) []string {
		return STASH
	},
}
