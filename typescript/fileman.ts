import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const root = path.resolve(fileURLToPath(import.meta.url), "../..");

const fileman = {
	path: {
		join: (pathString1, pathString2) => {
			return path.join(pathString1, pathString2);
		},
		fromRoot: (...pathString) => {
			return path.join(root, ...pathString);
		},
		resolves: (pathString) => {
			return path.resolve(pathString);
		},
		available: (pathString) => {
			try {
				const stats = fs.statSync(pathString);
				return { exist: true, type: stats.isDirectory() ? "folder" : "file" };
			} catch (error) {
				if (error.code === "ENOENT") {
					return { exist: false, type: "" };
				}
				console.error("Path check error:", error);
				throw error;
			}
		},
		ifFolder: (pathString) => {
			return fileman.path.available(pathString).type === "folder";
		},
		ifFile: (pathString) => {
			return fileman.path.available(pathString).type === "file";
		},
		isIndependent: (folder1, folder2) => {
			const relative1 = path.relative(folder1, folder2);
			const relative2 = path.relative(folder2, folder1);
			const notInside = (relative) =>
				(relative && relative.startsWith("..")) || path.isAbsolute(relative);
			return notInside(relative1) && notInside(relative2);
		},
		listFiles: async (dir, fileList = []) => {
			if (!fs.existsSync(dir)) return fileList;
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
		listFolders: async (dir, folderList = []) => {
			if (!fs.existsSync(dir)) return folderList;
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
		hard: async (source, destination, ignoreFiles = []) => {
			const copyRecursiveAsync = async (src, dest) => {
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

			if (!fs.existsSync(source))
				throw new Error("target folder does not exist.\n" + source);
			await copyRecursiveAsync(source, destination);
		},
		safe: async (source, destination, ignoreFiles = []) => {
			const destinationFiles = fs.existsSync(destination)
				? (await fileman.path.listFiles(destination)).map((file) =>
					path.join(source, file.replace(destination, "")),
				)
				: [];
			await fileman.clone.hard(source, destination, [
				...ignoreFiles,
				...destinationFiles,
			]);
		},
	},
	read: {
		file: async (target, online = false) => {
			try {
				if (online) {
					const response = await fetch(target);
					if (!response.ok) throw new Error();
					return { status: true, data: await response.text() };
				} else {
					if (!fs.existsSync(target))
						throw new Error(`File does not exist: ${target}`);
					const fileData = await fs.promises.readFile(target, "utf8");
					return { status: true, data: fileData };
				}
			} catch (error) {
				return { status: false, data: "" };
			}
		},
		json: async (target, online = false) => {
			try {
				if (online) {
					const response = await fetch(target);
					if (!response.ok) throw new Error();
					return { status: true, data: await response.json() };
				} else {
					if (!fs.existsSync(target)) throw new Error();
					return {
						status: true,
						data: JSON.parse(
							(await fs.promises.readFile(target, "utf8"))
								.replace(/\/\*[\s\S]*?\*\//g, "")
								.replace(/^\s*\/\/.*$/gm, ""),
						),
					};
				}
			} catch (error) {
				return { status: false, data: {} };
			}
		},
		bulk: async (target, extensions = []) => {
			const result = {};
			extensions = extensions.map((ext) => "." + ext);
			const files = await fileman.path.listFiles(target);
			for (const file of files) {
				if (
					extensions.includes(path.extname(file)) ||
					extensions.length === 0
				) {
					result[file] = await fs.promises.readFile(file, "utf-8");
				}
			}
			return result;
		},
	},
	write: {
		file: async (filePath, content) => {
			try {
				const dir = path.dirname(filePath);
				if (!fs.existsSync(dir))
					await fs.promises.mkdir(dir, { recursive: true });
				await fs.promises.writeFile(filePath, content, "utf8");
			} catch (err) {
				console.error(`Error writing to file ${filePath}:`, err);
			}
		},
		json: async (pathString, object) => {
			try {
				const dir = path.dirname(pathString);
				if (!fs.existsSync(dir))
					await fs.promises.mkdir(dir, { recursive: true });
				await fs.promises.writeFile(
					pathString,
					JSON.stringify(object, null, 2),
					"utf8",
				);
			} catch (err) {
				console.error(`Error writing JSON data to ${pathString}:`, err);
			}
		},
		bulk: async (fileContentObject) => {
			for (const filePath in fileContentObject) {
				await fileman.write.file(filePath, fileContentObject[filePath]);
			}
		},
	},
	sync: {
		file: async (url, path) => {
			const latest = await fileman.read.file(url, true);
			if (latest.status) {
				await fileman.write.file(path, latest.data);
				return latest.data;
			}
			const current = await fileman.read.file(path);
			return current.status ? current.data : "";
		},
		json: async (url, path) => {
			const latest = await fileman.read.json(url, true);
			if (latest.status) {
				await fileman.write.json(path, latest.data);
				return latest.data;
			}
			const current = await fileman.read.json(path);
			return current.status ? current.data : {};
		},
		bulk: async (
			source,
			target,
			extInclude = [],
			extnUnsync = [],
			fileExcludes = [],
		) => {
			const result = { status: true, fileContents: {} };
			extInclude = extInclude.map((ext) => "." + ext);
			extnUnsync = extnUnsync.map((ext) => "." + ext);

			const sourceExists = fs.existsSync(source);
			const targetExists = fs.existsSync(target);
			if (!sourceExists && !targetExists)
				return { status: false, fileContents: {} };
			if (!targetExists) await fileman.clone.safe(target, source);
			if (!sourceExists) await fileman.clone.safe(source, target);

			const targetFiles = fileman.path.listFiles(target);
			const relativeTargetFiles = (await targetFiles)
				.map((file) => path.relative(target, file))
				.filter(
					(file) => !fileExcludes.some((ignore) => file.startsWith(ignore)),
				);
			const sourceFiles = fileman.path.listFiles(source);
			const relativeSourceFiles = (await sourceFiles)
				.map((file) => path.relative(source, file))
				.filter(
					(file) => !fileExcludes.some((ignore) => file.startsWith(ignore)),
				);

			for (const file of relativeTargetFiles) {
				if (
					!relativeSourceFiles.includes(file) ||
					extnUnsync.includes(path.extname(file))
				) {
					await fs.promises.unlink(path.join(target, file));
				}
			}

			for (const file of relativeSourceFiles) {
				const sourceFilePath = path.join(source, file);
				const targetFilePath = path.join(target, file);

				if (!fs.existsSync(targetFilePath)) {
					const sourceDirPath = path.dirname(sourceFilePath);
					if (!fs.existsSync(sourceDirPath))
						await fs.promises.mkdir(sourceDirPath, { recursive: true });
				}

				if (extInclude.includes(path.extname(file))) {
					result.fileContents[file] = await fs.promises.readFile(
						sourceFilePath,
						"utf-8",
					);
				} else {
					await fs.promises.copyFile(sourceFilePath, targetFilePath);
				}
			}

			const targetFolders = (await targetFiles)
				.map((file) => path.dirname(path.relative(source, file)))
				.filter((value, index, self) => self.indexOf(value) === index);

			for (const folder of targetFolders) {
				const targetFolderPath = path.join(target, folder);
				if (!fs.existsSync(targetFolderPath)) continue;
				const relativeFolder = path.relative(source, targetFolderPath);
				const sourceFolderPath = path.join(target, relativeFolder);
				if (!fs.existsSync(sourceFolderPath)) {
					fs.promises.rm(targetFolderPath, { recursive: true, force: true });
				}
			}
			return result;
		},
	},
	delete: {
		file: async (pathToDelete) => {
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
		bulk: async (...pathsToDelete) => {
			pathsToDelete.forEach((pathString) => fileman.delete.file(pathString));
		},
		folder: async (folderPath, extensions = [], ignorePaths = []) => {
			try {
				if (!fs.existsSync(folderPath)) {
					return { success: false, message: "Folder does not exist." };
				}
				const files = await fileman.path.listFiles(folderPath);
				for (const file of files) {
					if (ignorePaths.includes(file)) continue;
					if (
						extensions.length === 0 ||
						extensions.includes(path.extname(file))
					) {
						await fs.promises.unlink(file);
					}
				}
				const folders = await fileman.path.listFolders(folderPath);
				for (const subFolder of folders) {
					if (ignorePaths.includes(subFolder)) continue;
					await fs.promises.rm(subFolder, { recursive: true, force: true });
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
