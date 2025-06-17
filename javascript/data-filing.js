import Use from "./Utils/index.js";

export default function FILING(
	target,
	source,
	filePath,
	content,
	isXtylesFolder = false,
	isPortable = false,
) {
	const targetPath = target.length ? target + "/" + filePath : filePath;
	const sourcePath = source.length ? source + "/" + filePath : filePath;

	let [extension, fileName, id, cluster] = targetPath.slice(targetPath.lastIndexOf("/") + 1).split(".").reverse();
	id = isNaN(id) || id < 0 ? 0 : parseInt(id, 10);
	fileName = Use.string.normalize(fileName);

	const group = isPortable ? (extension === "css" ? "binding" : extension === "xcss" ? "xtyling" : "readme") :
		isXtylesFolder ? (Boolean(cluster) ? "cluster" : "axiom") : "proxy";

	const stamp = (isPortable ? `/${fileName}${group === "binding" ? "/$/" : "/"}` : "") +
		((id === 0 && extension === "css") ? "" : Use.string.normalize(cluster) + "$".repeat(id));

	return {
		// Default
		id,
		group,
		stamp,
		cluster,
		filePath,
		fileName,
		extension,
		sourcePath,
		targetPath,
		metaFront: `${isXtylesFolder ? group.toLocaleUpperCase() : ""}\\|${Use.string.normalize(targetPath, [], [], ["/", "."])}`,
		content: isXtylesFolder && extension !== "xcss" ? Use.code.uncomment.Css(content) : content,
		usedIndexes: new Set(),
		essentials: [],
		// for Proxy Class
		styleLocals: {},
		midway: "",
		summon: false,
		// for Cumulation
		classGroups: [],
		styleGlobals: {},
		preBinds: [],
		postBinds: [],
		styleMap: {},
		errors: [],
	};
}
