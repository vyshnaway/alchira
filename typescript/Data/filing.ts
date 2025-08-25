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
	fileGroup: "index" | "library" | "package" | "target",
	filePath: string,
	content: string,
	target = '',
	source = '',
) {
	const isLibrary = fileGroup === "library";
	const isPackage = fileGroup === "package";
	const fromXtylesFolder = fileGroup !== "target";

	const targetPath = target.length ? Fileman.path.join(target, filePath) : '';
	const sourcePath = source.length ? Fileman.path.join(source, filePath) : '';

	const [extension, packageName, id, cluster]: string[] = Fileman.path.basename(filePath).split(".").reverse();
	const num = Number(id);
	const idn = isNaN(num) || num < 0 ? 0 : Math.floor(num);
	const normalFileName = isPackage ? Use.string.normalize(packageName) : CACHE_STATIC.Package.Name;

	const group: t_FILE_Group = resolveGroup(extension, Boolean(cluster), isPackage, isLibrary);

	const classFront =
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
		classFront,
		debugclassFront: `${(fromXtylesFolder) ? group : ""}\\|${Use.string.normalize(filePath, [], [], ["/", "."])}`,
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
