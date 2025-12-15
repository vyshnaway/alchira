package style

import (
	"main/internal/action"
	"main/models"
	"maps"
)

func ResolveDependints(data *models.Cache_SymclassData) map[int]bool {
	if data.Dependint == nil {
		data.Dependint = map[int]bool{}
		for as := range data.SrcData.Attachments {
			if found := action.Index_Finder(as, data.Context.Cache.LocalMap); found.Index > 0 {
				r := ResolveDependints(found.Data)
				data.Dependint[found.Index] = true
				maps.Copy(data.Dependint, r)
			}
		}
	}
	return data.Dependint
}
