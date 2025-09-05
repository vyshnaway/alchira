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
	fromExternals: boolean,
	fromLibraries: boolean,
): _File._Type {
	if (fromExternals) {
		switch (extension) {
			case CACHE.ROOT.extension:
				return "EXTERNAL";
			case "css":
				return "EXATTACH";
			case "md":
				return "README";
			default:
				return "NULL";
		}
	}

	if (fromLibraries) {
		return hasCluster ? "CLUSTER" : "AXIOM";
	}

	return "TARGET";
}

export default function FILING(
	fileGroup: "library" | "external" | "target",
	filePath: string,
	content: string,
	target = '',
	source = '',
	label = '',
) {
	const isLibrary = fileGroup === "library";
	const isExternal = fileGroup === "external";
	const fromXtylesFolder = fileGroup !== "target";

	const targetPath = FILEMAN.path.join(target, filePath);
	const sourcePath = FILEMAN.path.join(source, filePath);

	const [extension, artifactName, liblevel, cluster]: string[] = FILEMAN.path.basename(filePath).split(".").reverse();
	const num = Number(liblevel);
	const idn = isNaN(num) || num < 0 ? 0 : Math.floor(num);
	const normalFileName = isExternal ? USE.string.normalize(artifactName) : CACHE.STATIC.Artifact.name;

	const group: _File._Type = resolveGroup(extension, Boolean(cluster), isExternal, isLibrary);
	const normalCluster = USE.string.normalize(cluster);

	const classFront =
		(
			isExternal ? `/${normalFileName}${group === "EXATTACH" ? "/$/" : "/"}` : ""
		) + (
			((idn > 0) && (extension === "css") && (normalCluster !== "-")) ? normalCluster : ""
		) + (
			isLibrary ? "$".repeat(idn) : ""
		);

	const result: _File.Storage = {
		liblevel: idn,
		label,
		artifact: fromXtylesFolder ? artifactName : CACHE.STATIC.Artifact.name,
		filePath,
		extension,
		sourcePath,
		targetPath,
		classFront,
		debugclassFront: `${(fromXtylesFolder) ? group : ""}\\|${USE.string.normalize(targetPath, [], [], ["/", "."])}`,
		manifesting: {
			lookup: {
				id: isLibrary ? String(idn) : isExternal ? filePath : targetPath,
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
