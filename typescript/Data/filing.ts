import Fileman from "../fileman.js";
import { t_FILE_Group, t_FILE_Storage } from "../types.js";
import Use from "../Utils/main.js";
import { CACHE_STATIC } from "./cache.js";

function resolveGroup(
	extension: string,
	hasCluster: boolean,
	fromPackage: boolean,
	fromLibrary: boolean,
): t_FILE_Group {
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
	filePath: string,
	content: string,
	target: string,
	source: string,
	fileGroup: "index" | "library" | "package" | "target"
) {
	const isLibrary = fileGroup === "library";
	const isPackage = fileGroup === "package";
	const fromXtylesFolder = fileGroup !== "target";

	const targetPath = target.length ? Fileman.path.join(target, filePath) : filePath;
	const sourcePath = source.length ? Fileman.path.join(source, filePath) : filePath;

	const [extension, packageName, id, cluster]: string[] = Fileman.path.basename(targetPath).split(".").reverse();
	const num = Number(id);
	const idn = isNaN(num) || num < 0 ? 0 : Math.floor(num);
	const normalFileName = isPackage ? Use.string.normalize(packageName) : CACHE_STATIC.PROJECT_NAME;

	const group: t_FILE_Group = resolveGroup(extension, Boolean(cluster), isPackage, isLibrary);

	const xcssclassFront =
		(
			isPackage ? `/${normalFileName}${group === "PACBIND" ? "/$/" : "/"}` : ""
		) + (
			(idn === 0 && extension === "css") ? "" : Use.string.normalize(cluster)
		) + (
			"$".repeat(idn)
		);

	const result: t_FILE_Storage = {
		filePath,
		extension,
		sourcePath,
		targetPath,
		packageName,
		xcssclassFront,
		metaclassFront: `${(fromXtylesFolder) ? group : ""}\\|${Use.string.normalize(targetPath, [], [], ["/", "."])}`,
		manifest: {
			refer: {
				id: (isLibrary) ? String(idn) : filePath,
				group,
			},
			global: {},
			local: {}
		},
		styleData: {
			usedIndexes: new Set(),
			styleGlobals: {},
			styleLocals: {},
			styleMap: {},
			classGroups: [],
			attachments: [],
			diagnostics: [],
			errors: [],
			hasMainTag: false,
			hasStyleTag: false,
			hasAttachTag: false,
			hasStencilTag: false,
		},
		content: (fromXtylesFolder && extension === "css") ? Use.code.uncomment.Css(content) : content,
		midway: "",
	};

	return result;
}
