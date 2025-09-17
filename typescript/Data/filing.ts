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
	fromArtifacts: boolean,
	fromLibraries: boolean,
): _File._Type {
	if (fromArtifacts) { return (extension === CACHE.ROOT.extension) ? "ARTIFACT" : "NULL"; }
	else if (fromLibraries) { return hasCluster ? "CLUSTER" : "AXIOM"; }
	else { return "TARGET"; }
}

export default function FILING(
	fileGroup: "library" | "artifact" | "target",
	filePath: string,
	content: string,
	target = '',
	source = '',
	label = '',
) {
	const isLibrary = fileGroup === "library";
	const isArtifact = fileGroup === "artifact";
	const fromXtylesFolder = fileGroup !== "target";

	const targetPath = FILEMAN.path.join(target, filePath);
	const sourcePath = FILEMAN.path.join(source, filePath);

	const [extension, artifactName, liblevel, cluster]: string[] = FILEMAN.path.basename(filePath).split(".").reverse();
	const num = Number(liblevel);
	const idn = (isNaN(num) || (num < 0) || (num > 2)) ? 0 : Math.floor(num);
	const normalFileName = isArtifact ? USE.string.normalize(artifactName) : CACHE.STATIC.Archive.name;

	const group: _File._Type = resolveGroup(extension, Boolean(cluster), isArtifact, isLibrary);
	const normalCluster = USE.string.normalize(cluster);

	const classFront =
		(
			isArtifact ? `/${normalFileName}/` : ""
		) + (
			((idn > 0) && (extension === "css") && (normalCluster !== "-")) ? normalCluster : ""
		) + (
			(fromXtylesFolder && extension === "css") ? "$".repeat(idn) : ""
		);

	const result: _File.Storage = {
		liblevel: idn,
		label,
		artifact: fromXtylesFolder ? artifactName : CACHE.STATIC.Archive.name,
		filePath,
		extension,
		sourcePath,
		targetPath,
		classFront,
		debugclassFront: `${(fromXtylesFolder) ? (group) : ""}\\|${USE.string.normalize(targetPath, [], [], ["/", "."])}`,
		manifesting: {
			lookup: {
				id: isLibrary ? String(idn) : isArtifact ? filePath : targetPath,
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
