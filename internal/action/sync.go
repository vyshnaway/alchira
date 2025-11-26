package action

import (
	_config "main/configs"
	_model "main/models"
	_css "main/package/css"
	_fileman "main/package/fileman"
	_util "main/package/utils"
	_map "maps"
	_os "os"
	_slice "slices"
	_sync "sync"
)

func Sync_RootDocs() {
	var wg _sync.WaitGroup
	var mut _sync.Mutex

	for item_name, item := range _config.Sync_Agreements {
		wg.Add(1)
		func() {
			content, err := _fileman.Sync_File(item.Url, item.Path)
			mut.Lock()
			item.Content = content
			if err == nil {
				_config.Sync_Agreements[item_name] = item
			}
			mut.Unlock()
			wg.Done()
		}()
	}

	for item_name, item := range _config.Sync_References {
		wg.Add(1)
		func() {
			content, err := _fileman.Sync_File(item.Url, item.Path)
			mut.Lock()
			item.Content = content
			if err == nil {
				_config.Sync_References[item_name] = item
			}
			mut.Unlock()
			wg.Done()
		}()
	}

	wg.Wait()
}

func Sync_SaveVendors(vendor_source string, try_remote bool) {

	newdata := false
	vendor_path := _config.Path_Json["vendors"].Path

	content := func() string {

		if try_remote {
			if r, e := _fileman.Read_File(vendor_source, true); e == nil {
				newdata = true
				return r
			}
			if r, e := _fileman.Read_File(_config.Root.Url.Vendors+vendor_source, true); e == nil {
				newdata = true
				return r
			}
		}

		if r, e := _fileman.Read_File(vendor_path, false); e == nil {
			return r
		}

		return ""
	}()

	if vendor_table, err := _util.Code_JsoncParse[_css.T_Vendor_Table](content); err == nil {
		_css.Vendor_Save(vendor_table)
		if newdata {
			_fileman.Write_File(vendor_path, content)
		}
	}
}

func Sync_ProxyMapDirs(proxyMaps []_model.Config_ProxyMap, concurrent bool) map[string]_model.Config_ProxyStorage {
	var mut _sync.Mutex
	var wg _sync.WaitGroup
	static_proxystorage := make(map[string]_model.Config_ProxyStorage, len(proxyMaps))

	for _, pm := range proxyMaps {
		wg.Add(1)

		go func(proxyMap _model.Config_ProxyMap) {
			defer wg.Done()

			fileContents, _ := _fileman.Sync_Bulk(
				proxyMap.Target,
				proxyMap.Source,
				_slice.Collect(_map.Keys(proxyMap.Extensions)),
				[]string{_config.Root.Extension},
				[]string{proxyMap.Stylesheet},
				!_config.Static.SERVER,
				concurrent,
			)

			stylesheetContent := ""
			if len(fileContents) > 0 {
				if content, err := _os.ReadFile(_fileman.Path_Join(proxyMap.Target, proxyMap.Stylesheet)); err == nil {
					stylesheetContent = string(content)
				}
			}

			mut.Lock()
			defer mut.Unlock()
			static_proxystorage[pm.Target] = _model.Config_ProxyStorage{
				Source:              _fileman.Path_Fix(pm.Source),
				Target:              _fileman.Path_Fix(pm.Target),
				Stylesheet:          _fileman.Path_Fix(pm.Stylesheet),
				Extensions:          pm.Extensions,
				Filepath_to_Content: fileContents,
				StylesheetContent:   stylesheetContent,
			}
		}(pm)
	}

	wg.Wait()
	return static_proxystorage
}
