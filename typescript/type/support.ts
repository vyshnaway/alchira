export type Command = ""
    | "init"
    | "debug"
    | "preview"
    | "publish"
    | "install";

export interface PackageEssential {
    bin: string;
    name: string;
    version: string;
}

export interface Event {
    timeStamp: string,
    action: string,
    folder: string,
    filePath: string,
    fileContent: string,
    extension: string,
}

export interface Diagnostic {
    message: string,
    sources: string[]
}
