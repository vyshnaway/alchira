package server

import (
	"fmt"
	// "main/package/fileman"
	"main/package/utils"
	"main/service/webview"
)

func Manifest(filepath string) (Exitcode int) {
	Simulate()

	// if path, err := fileman.Path_Resolves(filepath); err == nil {
	fmt.Println(utils.Code_JsonBuild(ManifestFile(filepath), ""))
	// }
	return 0
}

func Connect(port int) (Exitcode int, Port int) {
	Simulate()
	Exitcode, Port = webview.Create(port)
	return Exitcode, Port
}
