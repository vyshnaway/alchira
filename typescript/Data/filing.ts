import USE from "../utils/main.js";
import FILEMAN from "../fileman.js";

import * as TYPE from "../types.js";
import * as CACHE from "./cache.js";

function resolveGroup(
	extension: string,
	hasCluster: boolean,
	fromPackage: boolean,
	fromLibrary: boolean,
): TYPE.FILE_Group {
	if (fromPackage) {
		switch (extension) {
			case "css":
				return "PACBIND";
			case "xcss":
				return "PACKAGE";
			case "md":
				return "README";
			default:
				return "";
		}
	}

	if (fromLibrary) {
		return hasCluster ? "CLUSTER" : "AXIOM";
	}

	return "TARGET";
}

export default function FILING(
	fileGroup: "index" | "library" | "package" | "target",
	filePath: string,
	content: string,
	target = '',
	source = '',
	label = '',
) {
	const isLibrary = fileGroup === "library";
	const isPackage = fileGroup === "package";
	const fromXtylesFolder = fileGroup !== "target";

	const targetPath = target.length ? FILEMAN.path.join(target, filePath) : '';
	const sourcePath = source.length ? FILEMAN.path.join(source, filePath) : '';

	const [extension, packageName, id, cluster]: string[] = FILEMAN.path.basename(filePath).split(".").reverse();
	const num = Number(id);
	const idn = isNaN(num) || num < 0 ? 0 : Math.floor(num);
	const normalFileName = isPackage ? USE.string.normalize(packageName) : CACHE.STATIC.Package.Name;

	const group: TYPE.FILE_Group = resolveGroup(extension, Boolean(cluster), isPackage, isLibrary);

	const classFront =
		(
			isPackage ? `/${normalFileName}${group === "PACBIND" ? "/$/" : "/"}` : ""
		) + (
			(idn === 0 && extension === "css") ? "" : USE.string.normalize(cluster)
		) + (
			"$".repeat(idn)
		);

	const result: TYPE.FILE_Storage = {
		label,
		filePath,
		extension,
		sourcePath,
		targetPath,
		packageName,
		classFront,
		debugclassFront: `${(fromXtylesFolder) ? group : ""}\\|${USE.string.normalize(filePath, [], [], ["/", "."])}`,
		manifest: {
			refer: {
				id: isLibrary ? String(idn) : isPackage ? filePath : targetPath,
				group,
			},
			local: {},
			global: {},
			public: {},
			errors: [],
			diagnostics: [],
		},
		styleData: {
			usedIndexes: new Set(),
			globalClasses: {},
			localClasses: {},
			publicClasses: {},
			styleMap: {},
			classesList: [],
			attachments: [],
			hasStyleTag: false,
			styleTagReplaces: [],
			hasStapleTag: false,
			stapleTagReplaces: [],
		},
		content: (fromXtylesFolder && extension === "css") ? USE.code.uncomment.Css(content) : content,
		midway: "",
	};

	return result;
}
