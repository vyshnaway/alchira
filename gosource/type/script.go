package types

type Script_Actions int

const (
    read Script_Actions = iota
    sync
    watch
    monitor
)

type Script_RawStyle struct {
    elid         int
    element      string
    elvalue      string
    tagCount     int
    rowIndex     int
    colIndex     int
    endMarker    int
    symclasses   []string
    scope        Style_Type
    comments     []string
    attachstring string
    styles       map[string]string
    attributes   map[string]string
}

type Script_Cumulated struct {
    report        []string
    globalClasses map[string]int
    publicClasses map[string]int
    fileManifests map[string]File_LocalManifest
}
