// import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
// import * as _Style from "../type/style.js";
// import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";

import USE from "../utils/main.js";
import FILEMAN from "../fileman.js";

import * as CACHE from "./cache.js";

function resolveGroup(
	extension: string,
	hasCluster: boolean,
	fromPackage: boolean,
	fromLibrary: boolean,
): _File._Type {
	if (fromPackage) {
		switch (extension) {
			case "css":
				return _File._Type.PACBIND;
			case "xcss":
				return _File._Type.PACKAGE;
			case "md":
				return _File._Type.README;
			default:
				return _File._Type.NULL;
		}
	}

	if (fromLibrary) {
		return hasCluster ? _File._Type.CLUSTER : _File._Type.AXIOM;
	}

	return _File._Type.TARGET;
}

export default function FILING(
	fileGroup: "library" | "package" | "target",
	filePath: string,
	content: string,
	target = '',
	source = '',
	label = '',
) {
	const isLibrary = fileGroup === "library";
	const isPackage = fileGroup === "package";
	const fromXtylesFolder = fileGroup !== "target";

	const targetPath = FILEMAN.path.join(target, filePath);
	const sourcePath = FILEMAN.path.join(source, filePath);

	const [extension, packageName, id, cluster]: string[] = FILEMAN.path.basename(filePath).split(".").reverse();
	const num = Number(id);
	const idn = isNaN(num) || num < 0 ? 0 : Math.floor(num);
	const normalFileName = isPackage ? USE.string.normalize(packageName) : CACHE.STATIC.Artifact.name;

	const group: _File._Type = resolveGroup(extension, Boolean(cluster), isPackage, isLibrary);

	const classFront =
		(
			isPackage ? `/${normalFileName}${group === _File._Type.PACBIND ? "/$/" : "/"}` : ""
		) + (
			((idn > 0) && extension === "css") ? USE.string.normalize(cluster) : ""
		) + (
			isLibrary ? "$".repeat(idn) : ""
		);

	const result: _File.Storage = {
		label,
		filePath,
		extension,
		sourcePath,
		targetPath,
		packageName: fromXtylesFolder ? packageName : CACHE.STATIC.Artifact.name,
		classFront,
		debugclassFront: `${(fromXtylesFolder) ? group : ""}\\|${USE.string.normalize(filePath, [], [], ["/", "."])}`,
		manifest: {
			lookup: {
				id: isLibrary ? String(idn) : isPackage ? filePath : targetPath,
				type: group,
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
			classTracks: [],
			attachments: [],
			tagReplacements: [],
		},
		content: content,
		midway: "",
		scratch: "",
	};

	return result;
}
