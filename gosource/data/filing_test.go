package data

import (
	"fmt"
	"testing"
)

func TestFiling(t *testing.T) {
	// Example Usage 1: Basic file in xtyles folder
	fmt.Println("--- Example 1: Basic xtyles file ---")
	result1 := FILING("xtyles", "src", "components/button.axiom.css", ".button { color: blue; } /* comment */", true, false)
	fmt.Printf("Result 1: %+v\n\n", result1)
	// Expected:
	// ID: 0, Group: axiom, Stamp: "", FileName: button, Extension: css
	// Content: .button { color: blue; }

	// Example Usage 2: Portable CSS file
	fmt.Println("--- Example 2: Portable CSS file ---")
	result2 := FILING("", "dist", "my-lib/styles.css", "body { margin: 0; }", false, true)
	fmt.Printf("Result 2: %+v\n\n", result2)
	// Expected:
	// ID: 0, Group: binding, Stamp: "/my-lib/styles/$/", FileName: styles, Extension: css

	// Example Usage 3: Portable XCSS file with ID
	fmt.Println("--- Example 3: Portable XCSS file with ID ---")
	result3 := FILING("portable", "src", "utils/helpers.1.xcss", "/* helpers */", false, true)
	fmt.Printf("Result 3: %+v\n\n", result3)
	// Expected:
	// ID: 1, Group: xtyling, Stamp: "/utils/helpers/$/1", FileName: helpers, Extension: xcss

	// Example Usage 4: Cluster file in xtyles folder
	fmt.Println("--- Example 4: Cluster file ---")
	result4 := FILING("xtyles", "src", "theme/dark.cluster.0.css", "/* dark theme */", true, false)
	fmt.Printf("Result 4: %+v\n\n", result4)
	// Expected:
	// ID: 0, Group: cluster, Stamp: "dark$", FileName: dark, Extension: css

	// Example Usage 5: File with no extension, no target/source
	fmt.Println("--- Example 5: File with no extension ---")
	result5 := FILING("", "", "README", "Just a readme.", false, false)
	fmt.Printf("Result 5: %+v\n\n", result5)
	// Expected:
	// ID: 0, Group: proxy, Stamp: "", FileName: README, Extension: ""

	// Example Usage 6: File with complex name and cluster/id
	fmt.Println("--- Example 6: Complex file name ---")
	result6 := FILING("assets", "build", "images/logo.large.2.png", "", false, false)
	fmt.Printf("Result 6: %+v\n\n", result6)
	// Expected:
	// ID: 2, Group: proxy, Stamp: "large$$", FileName: logo, Extension: png

	// Example Usage 7: File with cluster but no ID
	fmt.Println("--- Example 7: Cluster, no ID ---")
	result7 := FILING("xtyles", "src", "components/card.layout.css", ".card-layout { display: block; }", true, false)
	fmt.Printf("Result 7: %+v\n\n", result7)
	// Expected:
	// ID: 0, Group: axiom, Stamp: "layout", FileName: card, Extension: css
}
