// import fs from 'fs'; // Remove fs import
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(fileURLToPath(import.meta.url), "../..")

const FILEMAN = {
    PATH: {
        join: (pathString1: string, pathString2: string): string => {
            return path.join(pathString1, pathString2)
        },
        fromRoot: (...pathString: string[]): string => {
            return path.join(root, ...pathString)
        },
        available: async (pathString: string): Promise<{ exist: boolean, type: string | null }> => {
            // Emulate availability check (always exists for now)
            return { exist: true, type: "file" };
        },
        ifFolder: async (pathString: string): Promise<boolean> => {
            return (await FILEMAN.PATH.available(pathString)).type === "folder"
        },
        ifFile: async (pathString: string): Promise<boolean> => {
            return (await FILEMAN.PATH.available(pathString)).type === "file"
        },
        isAncestor: (ancestor: string, descendant: string): boolean => {
            const relative = path.relative(ancestor, descendant);
            return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
        },
        listFiles: async (dir: string, fileList: string[] = []): Promise<string[]> => {
            // Emulate listing files (return empty list for now)
            return fileList;
        },
    },
    CLONE: {
        hard: async (source: string, destination: string, ignoreFiles: string[] = []): Promise<void> => {
            // Emulate hard clone (do nothing for now)
        },
        safe: async (source: string, destination: string, ignoreFiles: string[] = []): Promise<void> => {
            // Emulate safe clone (do nothing for now)
        },
    },
    READ: {
        file: async (target: string, online: boolean = false): Promise<{ status: boolean, data: string }> => {
            // Emulate reading file (return empty string for now)
            return { status: false, data: "" };
        },
        json: async (target: string, online: boolean = false): Promise<{ status: boolean, data: any }> => {
            // Emulate reading JSON (return empty object for now)
            return { status: false, data: {} };
        },
        bulk: async (target: string, extensions: string[] = []): Promise<{ [key: string]: string }> => {
            // Emulate bulk reading (return empty object for now)
            return {};
        },
    },
    WRITE: {
        file: async (filePath: string, content: string): Promise<void> => {
            // Emulate writing file (do nothing for now)
        },
        json: async (pathString: string, object: any): Promise<void> => {
            // Emulate writing JSON (do nothing for now)
        },
        bulk: async (fileContentObject: { [key: string]: string }): Promise<void> => {
            // Emulate bulk writing (do nothing for now)
        },
    },
    SYNC: {
        file: async (url: string, path: string): Promise<string> => {
            // Emulate syncing file (return empty string for now)
            return ""
        },
        json: async (url: string, path: string): Promise<any> => {
            // Emulate syncing JSON (return empty object for now)
            return {}
        },
        bulk: async (source: string, target: string, extensions: string[] = []): Promise<{ status: boolean, fileContent: { [key: string]: string }, syncMap: { [key: string]: string } }> => {
            // Emulate bulk syncing (return empty object for now)
            return { status: false, fileContent: {}, syncMap: {} }
        },
    },
    DELETE: async (pathToDelete: string): Promise<{ success: boolean, message: string }> => {
        // Emulate deleting (always fail)
        return { success: false, message: 'Deletion not supported.' };
    }
};

export default FILEMAN;

export async function CSSImport(filePathArray: string[] = []): Promise<string> {
    const processedFiles = new Set<string>(filePathArray);

    async function process(cssContent: string): Promise<string> {
        let result: string = cssContent;
        // for (const [match, filePath] of cssContent.matchAll(/@import\s+url\(["']?(.*?)["']?\);/g)) { // matchAll not available
        //     if (!processedFiles.has(filePath) && filePath.endsWith('.css')) {
        //         const content = (await FILEMAN.READ.file(filePath)).data || '';
        //         processedFiles.add(filePath);
        //         result = result.replace(match, await process(content));
        //     }
        // }
        return result;
    }

    return process(
        (await Promise.all(filePathArray.map(file => FILEMAN.READ.file(file))))
            .map(result => result.data || '')
            .join('\n')
    );
}
