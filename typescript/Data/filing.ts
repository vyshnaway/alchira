import { t_Data_FILING } from "../types.js";
import Use from "../Utils/main.js";

export default function FILING(
	target: string,
	source: string,
	filePath: string,
	content: string,
	isXtylesFolder = false,
	isPortable = false,
) {
	const targetPath = target.length ? target + "/" + filePath : filePath;
	const sourcePath = source.length ? source + "/" + filePath : filePath;

	const [extension, fileName, id, cluster]: string[] = targetPath.slice(targetPath.lastIndexOf("/") + 1).split(".").reverse();
	const idn = ((typeof id === "number") || Number(id) < 0) ? 0 : parseInt(id, 10);
	const normalFileName = Use.string.normalize(fileName);

	const group = isPortable ? (extension === "css" ? "binding" : extension === "xcss" ? "xtyling" : "readme") :
		isXtylesFolder ? (cluster ? "cluster" : "axiom") : "proxy";

	const stamp = (isPortable ? `/${normalFileName}${group === "binding" ? "/$/" : "/"}` : "") +
		((idn === 0 && extension === "css") ? "" : Use.string.normalize(cluster) + "$".repeat(idn));

	const result: t_Data_FILING = {
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
		content: isXtylesFolder && extension === "css" ? Use.code.uncomment.Css(content) : content,
		midway: "",
		manifest: {
			file: {
				group: '',
				id: ''
			},
			global: {},
			local: {}
		},
		styleData: {
			usedIndexes: new Set(),
			essentials: [],
			styleGlobals: {},
			styleLocals: {},
			styleMap: {},
			classGroups: [],
			attachments: [],
			errors: [],
			hasMainTag: false,
			hasStyleTag: false,
			hasAttachTag: false,
			hasStencilTag: false,
		}
	};

	return result;
}
