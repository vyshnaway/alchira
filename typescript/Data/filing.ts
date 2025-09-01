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
			case "css":
				return _File._Type.EXATTACH;
			case "xcss":
				return _File._Type.EXTERNAL;
			case "md":
				return _File._Type.README;
			default:
				return _File._Type.NULL;
		}
	}

	if (fromLibraries) {
		return hasCluster ? _File._Type.CLUSTER : _File._Type.AXIOM;
	}

	return _File._Type.TARGET;
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
	const iExternal = fileGroup === "external";
	const fromXtylesFolder = fileGroup !== "target";

	const targetPath = FILEMAN.path.join(target, filePath);
	const sourcePath = FILEMAN.path.join(source, filePath);

	const [extension, artifactName, liblevel, cluster]: string[] = FILEMAN.path.basename(filePath).split(".").reverse();
	const num = Number(liblevel);
	const idn = isNaN(num) || num < 0 ? 0 : Math.floor(num);
	const normalFileName = iExternal ? USE.string.normalize(artifactName) : CACHE.STATIC.Artifact.name;

	const group: _File._Type = resolveGroup(extension, Boolean(cluster), iExternal, isLibrary);
	const normalCluster = USE.string.normalize(cluster);

	const classFront =
		(
			iExternal ? `/${normalFileName}${group === _File._Type.EXATTACH ? "/$/" : "/"}` : ""
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
		debugclassFront: `${(fromXtylesFolder) ? group : ""}\\|${USE.string.normalize(filePath, [], [], ["/", "."])}`,
		manifest: {
			lookup: {
				id: isLibrary ? String(idn) : iExternal ? filePath : targetPath,
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
