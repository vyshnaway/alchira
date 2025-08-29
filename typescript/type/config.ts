export type Tweaks = Record<string, string | boolean>;

export interface ProxyMap {
    source: string,
    target: string,
    stylesheet: '',
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
    packages: Record<string, string>,
    proxy: ProxyMap[],
    tweaks: Tweaks
}

export interface Archive extends Base {
    readme: string,
    vendors?: string,
    packages?: Record<string, string>,
    proxy?: ProxyMap[],
    tweaks?: Tweaks
}