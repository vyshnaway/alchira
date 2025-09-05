export type Tweaks = Record<string, string | boolean>;

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
    externals: Record<string, string>,
    proxymap: ProxyMap[],
    tweaks: Tweaks
}

export interface Artifact extends Base {
    readme: string,
    shorthand: Record<string, string>,
    vendors?: string,
    externals?: Record<string, string>,
    proxy?: ProxyMap[],
    tweaks?: Tweaks
}