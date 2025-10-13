package server

import (
	"fmt"
	// "main/package/fileman"
	"main/package/utils"
)

func Manifest(filepath string) (Exitcode int) {
	Simulate()

	// if path, err := fileman.Path_Resolves(filepath); err == nil {
		fmt.Println(utils.Code_JsonBuild(ManifestFile(filepath), ""))
	// }
	return 0
}
