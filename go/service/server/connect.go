package server

import (
	"bufio"
	"fmt"
	"main/package/utils"
	"main/service/server/preview"
	"os"
	"strings"
)

var DATA = struct {
	Port int
	Url  string
}{
	Port: 0,
	Url:  "",
}

func Bridge(port int) {
	if p, e := preview.Create(port); e == nil {
		DATA.Port = p
		DATA.Url = fmt.Sprintf("http://localhost:%d", p)
	}

	Dryrun(Execute_Step_Initialize)
	
	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		str := scanner.Text()
		if strings.HasPrefix(str, "$ ") {
			fmt.Println("Preview command received (not implemented)")
			split := strings.Fields(str[2:])
			if len(split) < 1 {
				continue
			}
			command := split[0]
			arguments := split[1:]

			switch command {
			case "manifest":
				if len(arguments) > 0 {
					filepath := arguments[0]
					result := ManifestFile(filepath)
					fmt.Println(utils.Code_JsonBuild(result, "  "))
				} else {
					fmt.Println("Error: manifest command missing argument [filepath]")
				}
			case "preview":
				// Implement preview handling if needed
				fmt.Println("Preview command received (not implemented)")
			default:
				fmt.Printf("Unknown command: %s\n", command)
			}
		}
	}
	if err := scanner.Err(); err != nil {
		fmt.Fprintln(os.Stderr, "Error reading from stdin:", err)
	}
}
