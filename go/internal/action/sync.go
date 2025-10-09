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

func Sync_SaveVendors(vendor_source string) {

	newdata := false
	vendor_path := _config.Path_Json["vendors"].Path

	content := func() string {

		if r, e := _fileman.Read_File(vendor_source, true); e == nil {
			newdata = true
			return r
		}
		if r, e := _fileman.Read_File(_config.Root.Url.Vendors+vendor_source, true); e == nil {
			newdata = true
			return r
		}
		if r, e := _fileman.Read_File(vendor_path, false); e == nil {
			return r
		}

		return ""
	}()

	if vendor_table, err := _util.Code_JsonParse[_css.T_Vendor_Table](content); err == nil {
		_css.Vendor_Save(vendor_table)
		if newdata {
			_fileman.Write_File(vendor_path, content)
		}
	}
}

func Sync_ProxyMapDirs(proxyMaps []_model.Config_ProxyMap) map[string]_model.Config_ProxyStorage {
	static_proxystorage := make(map[string]_model.Config_ProxyStorage)
	for _, p := range proxyMaps {
		static_proxystorage[p.Target] = _model.Config_ProxyStorage{
			Source:              p.Source,
			Target:              p.Target,
			Stylesheet:          p.Stylesheet,
			Extensions:          p.Extensions,
			Filepath_to_Content: make(map[string]string),
			StylesheetContent:   "",
		}
	}
	var mut _sync.Mutex

	var wg _sync.WaitGroup
	for id, pm := range static_proxystorage {
		wg.Add(1)
		go func(proxyid string, proxystorage _model.Config_ProxyStorage) {
			proxystorage.Extensions[_config.Root.Extension] = []string{}
			fileContents, err := _fileman.Sync_Bulk(
				proxystorage.Target,
				proxystorage.Source,
				_slice.Collect(_map.Keys(proxystorage.Extensions)),
				[]string{_config.Root.Extension},
				[]string{proxystorage.Stylesheet},
			)
			if err == nil && len(fileContents) > 0 {
				proxystorage.Filepath_to_Content = fileContents
				if content, err := _os.ReadFile(_fileman.Path_Join(proxystorage.Target, proxystorage.Stylesheet)); err == nil {
					proxystorage.StylesheetContent = string(content)
				}

			}
			mut.Lock()
			defer mut.Unlock()
			static_proxystorage[proxyid] = proxystorage
			defer wg.Done()
		}(id, pm)
	}

	wg.Wait()
	return static_proxystorage
}
