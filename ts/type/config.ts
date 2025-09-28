export type Tweaks = Record<string, boolean>;

export interface ProxyMap {
    source: string,
    target: string,
    stylesheet: string,
    extensions: Record<string, string[]>,
}

export interface ProxyStorage extends ProxyMap {
    fileContents: Record<string, string>,
    stylesheetContent: string
}

interface Base {
    name: string,
    version: string,
}

export interface Raw extends Base {
    vendors: string,
    artifacts: Record<string, string>,
    proxymap: ProxyMap[],
    tweaks: Tweaks
}

export interface Archive extends Base {
    tweaks?: Tweaks,
    vendors?: string,
    proxymap?: ProxyMap[],
    artifacts?: Record<string, string>,
    readme?: string,
    licence?: string,
    exportsheet?: string,
    exportclasses?: string[],
    libraries?: Record<string, string>,
}