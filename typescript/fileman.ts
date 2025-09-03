import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Determine the root directory of the project.
// This assumes the utility file is within a 'utils' or similar directory
// one level down from the project root. Adjust "../.." if your structure differs.
const root = path.resolve(fileURLToPath(import.meta.url), "..", "..", "..");

/**
 * Represents the structure of the return object from `fileman.path.available`.
 */
interface PathAvailability {
	exist: boolean;
	type: "folder" | "file" | "";
}

/**
 * Represents the structure of the return object from `fileman.read.file` or `fileman.read.json`.
 */
interface FileReadResult<T> {
	status: boolean;
	data: T;
}

const fileman = {
	path: {
		basename: (pathString: string) => {
			return path.basename(pathString);
		},

		/**
		 * Joins multiple path segments together.
		 * @param pathString1 The first path segment.
		 * @param pathString2 The second path segment.
		 * @returns The joined path string.
		 */
		join: (...pathFrags: string[]): string => {
			return path.join(...pathFrags);
		},

		/**
		 * Joins path segments to the calculated root directory of the project.
		 * @param pathStrings - Multiple path segments to join.
		 * @returns The absolute path from the project root.
		 */
		fromOrigin: (...pathStrings: string[]): string => {
			return path.join(root, ...pathStrings);
		},

		/**
		 * Resolves a sequence of paths or path segments into an absolute path.
		 * @param pathString The path string to resolve.
		 * @returns The resolved absolute path.
		 */
		resolves: (pathString: string): string => {
			return path.resolve(pathString);
		},

		/**
		 * Checks if a given path exists and determines its type (file or folder).
		 * @param pathString The path to check.
		 * @returns An object indicating existence and  TYPE.
		 */
		available: (pathString: string): PathAvailability => {
			try {
				const stats = fs.statSync(pathString);
				return { exist: true, type: stats.isDirectory() ? "folder" : "file" };
			} catch (error: unknown) {
				const err = error as NodeJS.ErrnoException;
				if (err.code === "ENOENT") {
					return { exist: false, type: "" };
				}

				console.error("Path check error:", error);
				throw error;
			}
		},

		/**
		 * Checks if a given path points to a folder.
		 * @param pathString The path to check.
		 * @returns True if the path is a folder, false otherwise.
		 */
		ifFolder: (pathString: string): boolean => {
			return fileman.path.available(pathString).type === "folder";
		},

		/**
		 * Checks if a given path points to a file.
		 * @param pathString The path to check.
		 * @returns True if the path is a file, false otherwise.
		 */
		ifFile: (pathString: string): boolean => {
			return fileman.path.available(pathString).type === "file";
		},

		/**
		 * Checks if two folders are independent (neither is a descendant of the other).
		 * @param folder1 The path to the first folder.
		 * @param folder2 The path to the second folder.
		 * @returns True if the folders are independent, false otherwise.
		 */
		isIndependent: (folder1: string, folder2: string): boolean => {
			const relative1 = path.relative(folder1, folder2);
			const relative2 = path.relative(folder2, folder1);
			const notInside = (relative: string) =>
				(relative && relative.startsWith("..")) || path.isAbsolute(relative);
			return notInside(relative1) && notInside(relative2);
		},

		/**
		 * Recursively lists all files in a directory.
		 * @param dir The directory to list files from.
		 * @param fileList An optional array to accumulate file paths (for recursion).
		 * @returns A promise that resolves to an array of file paths.
		 */
		listFiles: async (dir: string, fileList: string[] = []): Promise<string[]> => {
			if (!fs.existsSync(dir)) { return fileList; }
			const files = await fs.promises.readdir(dir);
			for (const file of files) {
				const filePath = path.join(dir, file);
				const stats = await fs.promises.stat(filePath);
				if (stats.isDirectory()) {
					fileList = await fileman.path.listFiles(filePath, fileList);
				} else {
					fileList.push(filePath);
				}
			}
			return fileList;
		},

		/**
		 * Recursively lists all folders in a directory.
		 * @param dir The directory to list folders from.
		 * @param folderList An optional array to accumulate folder paths (for recursion).
		 * @returns A promise that resolves to an array of folder paths.
		 */
		listFolders: async (dir: string, folderList: string[] = []): Promise<string[]> => {
			if (!fs.existsSync(dir)) { return folderList; }
			const files = await fs.promises.readdir(dir);
			for (const file of files) {
				const filePath = path.join(dir, file);
				const stats = await fs.promises.stat(filePath);
				if (stats.isDirectory()) {
					folderList.push(filePath);
					folderList = await fileman.path.listFolders(filePath, folderList);
				}
			}
			return folderList;
		},
	},
	clone: {
		/**
		 * Performs a hard copy (clones) of a source directory to a destination, ignoring specified files.
		 * @param source The source path to clone.
		 * @param destination The destination path.
		 * @param ignoreFiles An array of file paths to ignore during cloning.
		 * @returns A promise that resolves when the cloning is complete.
		 * @throws Error if the source path does not exist.
		 */
		hard: async (source: string, destination: string, ignoreFiles: string[] = []): Promise<void> => {
			const copyRecursiveAsync = async (src: string, dest: string): Promise<void> => {
				const stats = await fs.promises.stat(src);
				if (stats.isDirectory()) {
					await fs.promises.mkdir(dest, { recursive: true });
					const children = await fs.promises.readdir(src);
					for (const child of children) {
						const childSrc = path.join(src, child);
						const childDest = path.join(dest, child);
						if (!ignoreFiles.includes(childSrc)) {
							await copyRecursiveAsync(childSrc, childDest);
						}
					}
				} else if (!ignoreFiles.includes(src)) {
					await fs.promises.copyFile(src, dest);
				}
			};

			if (!fs.existsSync(source)) {
				throw new Error("Target folder does not exist.\n" + source);
			}
			await copyRecursiveAsync(source, destination);
		},

		/**
		 * Safely clones a source directory to a destination, preventing overwrites of existing files in the destination.
		 * @param source The source path to clone.
		 * @param destination The destination path.
		 * @param ignoreFiles An array of file paths to explicitly ignore during cloning.
		 * @returns A promise that resolves when the safe cloning is complete.
		 */
		safe: async (source: string, destination: string, ignoreFiles: string[] = []): Promise<void> => {
			const destinationFiles = fs.existsSync(destination)
				? [
					...(await fileman.path.listFiles(destination)),
					...(await fileman.path.listFolders(destination))
				].map((file) =>
					path.join(source, file.replace(destination, ""))
				)
				: [];
			await fileman.clone.hard(source, destination, [
				...ignoreFiles,
				...destinationFiles,
			]);
		},
	},
	read: {
		/**
		 * Reads the content of a file. Can read from a local path or a URL.
		 * @param target The file path or URL to read.
		 * @param online If true, attempts to fetch the file from a URL.
		 * @returns A promise that resolves to an object containing status and data.
		 */
		file: async (target: string, online = false): Promise<FileReadResult<string>> => {
			try {
				if (online) {
					const response = await fetch(target);
					if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
					return { status: true, data: await response.text() };
				} else {
					if (!fs.existsSync(target)) {
						throw new Error(`File does not exist: ${target}`);
					}
					const fileData = await fs.promises.readFile(target, "utf8");
					return { status: true, data: fileData };
				}
			} catch {
				return { status: false, data: "" };
			}
		},

		/**
		 * Reads and parses a JSON file. Can read from a local path or a URL.
		 * Removes comments from local JSON files before parsing.
		 * @param target The file path or URL to read.
		 * @param online If true, attempts to fetch the JSON from a URL.
		 * @returns A promise that resolves to an object containing status and parsed JSON data.
		 */
		json: async <T = object>(target: string, online = false): Promise<FileReadResult<T>> => {
			try {
				if (online) {
					const response = await fetch(target);
					if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
					return { status: true, data: await response.json() as T };
				} else {
					if (!fs.existsSync(target)) { throw new Error(`File does not exist: ${target}`); }
					const fileContent = await fs.promises.readFile(target, "utf8");
					// Remove single-line and multi-line comments from JSON string
					const cleanedContent = fileContent
						.replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
						.replace(/^\s*\/\/.*$/gm, ""); // Remove single-line comments
					return {
						status: true,
						data: JSON.parse(cleanedContent),
					};
				}
			} catch {
				return { status: false, data: {} as T };
			}
		},

		/**
		 * Reads multiple files from a target directory based on specified extensions.
		 * @param target The directory to read files from.
		 * @param extensions An array of file extensions (e.g., ["txt", "md"]). If empty, all files are read.
		 * @returns A promise that resolves to an object where keys are file paths and values are their content.
		 */
		bulk: async (target: string, extensions: string[] = []): Promise<Record<string, string>> => {
			const result: Record<string, string> = {};
			const desiredExtensions = extensions.map((ext) => "." + ext);
			const files = await fileman.path.listFiles(target);
			for (const file of files) {
				if (
					desiredExtensions.includes(path.extname(file)) ||
					desiredExtensions.length === 0
				) {
					result[file] = await fs.promises.readFile(file, "utf-8");
				}
			}
			return result;
		},
	},
	write: {
		/**
		 * Writes content to a file. Creates parent directories if they don't exist.
		 * @param filePath The path to the file to write.
		 * @param content The content to write to the file.
		 * @returns A promise that resolves when the file is written.
		 */
		file: async (filePath: string, content: string): Promise<void> => {
			try {
				const dir = path.dirname(filePath);
				if (!fs.existsSync(dir)) {
					await fs.promises.mkdir(dir, { recursive: true });
				}
				await fs.promises.writeFile(filePath, content, "utf8");
			} catch (err) {
				console.error(`Error writing to file ${filePath}:`, err);
			}
		},

		/**
		 * Writes a JavaScript object to a JSON file. Creates parent directories if they don't exist.
		 * @param pathString The path to the JSON file to write.
		 * @param object The JavaScript object to write as JSON.
		 * @returns A promise that resolves when the JSON file is written.
		 */
		json: async (pathString: string, object: object): Promise<void> => {
			try {
				const dir = path.dirname(pathString);
				if (!fs.existsSync(dir)) {
					await fs.promises.mkdir(dir, { recursive: true });
				}
				await fs.promises.writeFile(
					pathString,
					JSON.stringify(object, null, 2),
					"utf8"
				);
			} catch (err) {
				console.error(`Error writing JSON data to ${pathString}:`, err);
			}
		},

		/**
		 * Writes multiple files from an object where keys are file paths and values are their content.
		 * @param fileContentObject An object mapping file paths to their content.
		 * @returns A promise that resolves when all files are written.
		 */
		bulk: async (fileContentObject: Record<string, string>): Promise<void> => {
			for (const filePath in fileContentObject) {
				await fileman.write.file(filePath, fileContentObject[filePath]);
			}
		},
	},
	sync: {
		/**
		 * Synchronizes a local file with an online version.
		 * If the online version is available, it's downloaded and written locally.
		 * Otherwise, the existing local file content is returned.
		 * @param url The URL of the online file.
		 * @param localPath The local path to store the file.
		 * @returns A promise that resolves to the content of the file.
		 */
		file: async (url: string, localPath: string): Promise<string> => {
			const latest = await fileman.read.file(url, true);
			if (latest.status) { await fileman.write.file(localPath, latest.data); }
			
			const current = await fileman.read.file(localPath);
			if (current.status) { return current.data; }

			await fileman.write.file(localPath, latest.data); 
			return "";
		},

		/**
		 * Synchronizes a local JSON file with an online version.
		 * If the online version is available, it's downloaded and written locally.
		 * Otherwise, the existing local JSON data is returned.
		 * @param url The URL of the online JSON file.
		 * @param localPath The local path to store the JSON file.
		 * @returns A promise that resolves to the parsed JSON data.
		 */
		json: async <T = object>(url: string, localPath: string): Promise<T> => {
			const latest = await fileman.read.json<T>(url, true);
			if (latest.status) {
				await fileman.write.json(localPath, latest.data as object);
				return latest.data;
			}
			const current = await fileman.read.json<T>(localPath);
			return current.status ? current.data : {} as T;
		},

		/**
		 * Synchronizes files between a source and target directory.
		 * Files present in the target but not in the source (and not unsynced extensions) are deleted from the target.
		 * Files from the source are copied to the target.
		 * Optionally reads content of included extensions into the result.
		 * @param source The source directory.
		 * @param target The target directory to synchronize with.
		 * @param extInclude An array of extensions whose files should have their content returned in the result.
		 * @param extnUnsync An array of extensions that should not be synchronized (i.e., deleted from target if not in source).
		 * @param fileExcludes An array of file paths (relative to source/target) to completely exclude from sync operations.
		 * @returns A promise that resolves to an object indicating status and the content of included files.
		 */
		bulk: async (
			source: string,
			target: string,
			extInclude: string[] = [],
			extnUnsync: string[] = [],
			fileExcludes: string[] = []
		): Promise<{ status: boolean; fileContents: Record<string, string> }> => {
			const result: { status: boolean; fileContents: Record<string, string> } = {
				status: true,
				fileContents: {},
			};
			const includeExtensions = extInclude.map((ext) => "." + ext);
			const unsyncExtensions = extnUnsync.map((ext) => "." + ext);

			const sourceExists = fs.existsSync(source);
			const targetExists = fs.existsSync(target);

			if (!sourceExists && !targetExists) {
				return { status: false, fileContents: {} };
			}
			// Ensure both source and target exist, if one is missing, safely clone from the existing one.
			if (!targetExists) {
				await fileman.clone.hard(source, target);
			} else if (!sourceExists) {
				await fileman.clone.hard(target, source); // Cloned target to source to ensure source exists for comparisons
			}


			const targetFiles = await fileman.path.listFiles(target);
			const relativeTargetFiles = targetFiles
				.map((file) => path.relative(target, file))
				.filter(
					(file) => !fileExcludes.some((ignore) => file.startsWith(ignore))
				);

			const sourceFiles = await fileman.path.listFiles(source);
			const relativeSourceFiles = sourceFiles
				.map((file) => path.relative(source, file))
				.filter(
					(file) => !fileExcludes.some((ignore) => file.startsWith(ignore))
				);

			// Delete files in target that are not in source or have unsynced extensions
			for (const file of relativeTargetFiles) {
				if (
					!relativeSourceFiles.includes(file) ||
					unsyncExtensions.includes(path.extname(file))
				) {
					await fs.promises.unlink(path.join(target, file));
				}
			}

			// Copy files from source to target and populate fileContents for included extensions
			for (const file of relativeSourceFiles) {
				const sourceFilePath = path.join(source, file);
				const targetFilePath = path.join(target, file);

				const targetDirPath = path.dirname(targetFilePath);
				if (!fs.existsSync(targetDirPath)) {
					await fs.promises.mkdir(targetDirPath, { recursive: true });
				}

				if (includeExtensions.includes(path.extname(file))) {
					result.fileContents[file] = await fs.promises.readFile(
						sourceFilePath,
						"utf-8"
					);
				} else {
					await fs.promises.copyFile(sourceFilePath, targetFilePath);
				}
			}

			// Clean up empty folders in target that no longer have a corresponding source folder
			const targetFolders = (await fileman.path.listFolders(target))
				.map((folder) => path.relative(target, folder))
				.filter((value, index, self) => self.indexOf(value) === index); // Get unique relative paths

			for (const folder of targetFolders) {
				const targetFolderPath = path.join(target, folder);
				const sourceFolderPath = path.join(source, folder); // Correctly check against source
				if (fs.existsSync(targetFolderPath) && !fs.existsSync(sourceFolderPath)) {
					// If a folder exists in target but not in source, and is empty after file cleanup, remove it.
					// This check is a bit tricky; a safer approach might be to just try and remove empty folders.
					// For now, let's just ensure it's not a root of a file that was just copied.
					const filesInTargetFolder = await fs.promises.readdir(targetFolderPath);
					if (filesInTargetFolder.length === 0) { // Only remove if truly empty
						await fs.promises.rm(targetFolderPath, { recursive: true, force: true });
					}
				}
			}

			return result;
		},
	},
	delete: {
		/**
		 * Deletes a file or a folder (recursively for folders).
		 * @param pathToDelete The path to the file or folder to delete.
		 * @returns A promise that resolves to an object indicating success and a message.
		 */
		file: async (pathToDelete: string): Promise<{ success: boolean; message: string }> => {
			try {
				if (fs.existsSync(pathToDelete)) {
					const stats = await fs.promises.stat(pathToDelete);
					if (stats.isDirectory()) {
						await fs.promises.rm(pathToDelete, {
							recursive: true,
							force: true,
						});
					} else {
						await fs.promises.unlink(pathToDelete);
					}
					return { success: true, message: "Path deleted successfully." };
				}
				return { success: false, message: "Path does not exist." };
			} catch (error) {
				console.error("Error deleting path:", error);
				return { success: false, message: "Error deleting path." };
			}
		},

		/**
		 * Deletes multiple files or folders in bulk.
		 * @param pathsToDelete A spread array of paths to delete.
		 * @returns A promise that resolves when all paths are processed.
		 */
		bulk: async (...pathsToDelete: string[]): Promise<void> => {
			await Promise.all(pathsToDelete.map((pathString) => fileman.delete.file(pathString)));
		},

		/**
		 * Cleans a folder by deleting its contents based on extensions and ignored paths.
		 * Leaves the folder itself intact.
		 * @param folderPath The path of the folder to clean.
		 * @param extensions An array of file extensions to delete. If empty, all files are deleted.
		 * @param ignorePaths An array of absolute paths (files or folders) to ignore during deletion.
		 * @returns A promise that resolves to an object indicating success and a message.
		 */
		folder: async (
			folderPath: string,
			extensions: string[] = [],
			ignorePaths: string[] = []
		): Promise<{ success: boolean; message: string }> => {
			try {
				if (!fs.existsSync(folderPath)) {
					return { success: false, message: "Folder does not exist." };
				}
				const files = await fileman.path.listFiles(folderPath);
				for (const file of files) {
					if (ignorePaths.includes(file)) { continue; }
					if (
						extensions.length === 0 ||
						extensions.includes(path.extname(file).substring(1))
					) {
						await fs.promises.unlink(file);
					}
				}
				const folders = await fileman.path.listFolders(folderPath);
				// Delete subfolders in reverse order to ensure nested empty folders are removed
				for (let i = folders.length - 1; i >= 0; i--) {
					const subFolder = folders[i];
					if (ignorePaths.includes(subFolder)) { continue; }
					const filesInSubFolder = await fs.promises.readdir(subFolder);
					if (filesInSubFolder.length === 0) { // Only remove if truly empty after file deletion
						await fs.promises.rm(subFolder, { recursive: true, force: true });
					}
				}
				return { success: true, message: "Folder cleaned successfully." };
			} catch (error) {
				console.error("Error cleaning folder:", error);
				return { success: false, message: "Error cleaning folder." };
			}
		},
	},
};

export default fileman;