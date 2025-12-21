package script

import (
	"main/package/utils"
	"strings"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
)

func Modifier(OP, TEXT string) string {
	BYTE := []byte(TEXT)

	switch OP {

	case "MD":
		extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock
		p := parser.NewWithExtensions(extensions)
		doc := p.Parse(BYTE)

		// create HTML renderer with extensions
		htmlFlags := html.CommonFlags | html.HrefTargetBlank
		opts := html.RendererOptions{Flags: htmlFlags}
		renderer := html.NewRenderer(opts)

		return string(markdown.Render(doc, renderer))

	case "STRIP":
		return utils.Code_Strip(TEXT, false, false, true, true)

	case "DEDENT":
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
			return TEXT
		}

		var result []string
		for _, line := range lines {
			if len(line) >= minIndent {
				result = append(result, line[minIndent:])
			} else {
				result = append(result, strings.TrimLeft(line, " \t"))
			}
		}

		return strings.Join(result, "\n")

	default:
		return TEXT
	}

}
