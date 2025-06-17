import PARSE from "./parse.js";

import $ from "../Shell/index.js";
import Use from "../Utils/index.js";
import FILING from "../data-filing.js";
import SCRIPTFILE from "../Script/file.js";
import { NAV, CACHE, STACK, RAW, INDEX } from "../data-cache.js";

function _DeleteLibraryFile(filePath) {
	if (STACK.LIBRARIES[filePath]) {
		STACK.LIBRARIES[filePath].usedIndexes.forEach(i => INDEX.DISPOSE(i));
		delete STACK.LIBRARIES[filePath];
	}
}

function _DeletePortableFile(filePath) {
	if (STACK.PORTABLES[filePath]) {
		STACK.PORTABLES[filePath].usedIndexes.forEach(i => INDEX.DISPOSE(i));
		delete STACK.PORTABLES[filePath];
	}
}

function _ClearStash() {
	Object.entries(CACHE.LibraryStyle2Index).forEach(([selector, index]) => {
		DISPOSE(index);
		delete CACHE.LibraryStyle2Index[selector]
	})
	Object.entries(CACHE.PortableStyle2Index).forEach(([selector, index]) => {
		DISPOSE(index);
		delete CACHE.PortableStyle2Index[selector]
	})
	CACHE.PortableEssentials = []

	Object.keys(STACK.LIBRARIES).forEach((filePath) => _DeleteLibraryFile(filePath));
	Object.keys(STACK.PORTABLES).forEach((filePath) => _DeletePortableFile(filePath));
}

function _SaveLibraryFile(filePath, fileContent) {
	if (STACK.LIBRARIES[filePath]) _DeleteLibraryFile(filePath);
	STACK.LIBRARIES[filePath] = FILING(
		"",
		NAV.folder.library,
		filePath.slice(NAV.folder.library.length + 1),
		fileContent, true, false
	);
}

function _SavePortableFile(filePath, fileContent) {
	if (STACK.PORTABLES[filePath]) _DeletePortableFile(filePath);
	STACK.PORTABLES[filePath] = FILING(
		"",
		NAV.folder.portables,
		filePath.slice(NAV.folder.portables.length + 1),
		fileContent, true, true
	);
}


/////////////////////////////////////////////////////////////////////////////

function _StackLibraryFiles() {
	let length = 0;
	const axiom = {}, cluster = {}, libraryTable = {};
	Object.entries(STACK.LIBRARIES).forEach(([filePath, fileData]) => {
		const { id, group } = fileData;
		libraryTable[filePath] = { group, id };
		if (group === "axiom") {
			if (!axiom[id]) axiom[id] = [];
			axiom[id].push(fileData);
		} else if (group === "cluster") {
			if (!cluster[id]) cluster[id] = [];
			cluster[id].push(fileData);
		}
		if (id > length) length = id;
	});
	const axiomsArray = Use.array.fromNumberedObject(axiom, length);
	const clustersArray = Use.array.fromNumberedObject(cluster, length);
	return { libraryTable, axiomsArray, clustersArray };
}

function _StackPortableFiles() {
	const bindingArray = [], xtylingArray = [], modulesTable = {};

	Object.entries(STACK.PORTABLES).forEach(([filePath, fileData]) => {
		fileData.id = filePath;
		const { id, group } = fileData;
		modulesTable[filePath] = { group, id };
		if (group === "binding") bindingArray.push(fileData);
		else if (group === "xtyling") xtylingArray.push(fileData);
	});

	return { modulesTable, bindingArray, portablesArray: xtylingArray };
}


/////////////////////////////////////////////////////////////////////////////


let axiomCount = 0,
	clusterCount = 0,
	portableCount = 0,
	bindingCount = 0;
let axiomChart = {},
	clusterChart = {},
	portableChart = {},
	bindingChart = {};
let report = "",
	warnings = [];

function _UpdateFiles() {
	_ClearStash();
	Object.entries(RAW.LIBRARIES).forEach(([filePath, fileContent]) => {
		_SaveLibraryFile(filePath, fileContent);
	});
	Object.entries(RAW.PORTABLES).forEach(([filePath, fileContent]) => {
		_SavePortableFile(filePath, fileContent);
	});

}

function ReRender() {
	_UpdateFiles();

	report = "", warnings = [];
	(axiomCount = 0), (clusterCount = 0), (portableCount = 0), (bindingCount = 0);
	(axiomChart = {}), (clusterChart = {}), (portableChart = {}), (bindingChart = {});

	const { libraryTable, axiomsArray, clustersArray } = _StackLibraryFiles();
	const { modulesTable, bindingArray, portablesArray } = _StackPortableFiles();

	const ModuleEssentials = [];
	const PortableStyleSkeleton = portablesArray.reduce((collection, fileData) => {
		const filePath = NAV.folder.portables + "/" + fileData.filePath;
		const tagStash = SCRIPTFILE(fileData).stylesList, indexSkeleton = {};
		fileData.usedIndexes = new Set();

		tagStash.forEach((style) => {
			style.scope = "xtyling";
			const response = PARSE.TAGSTYLE(
				style,
				fileData.metaFront,
				fileData.filePath,
				fileData.sourcePath,
				CACHE.PortableStyle2Index,
				fileData.stamp
			);
			warnings.push(...response.errors);

			if (response.selector === "") {
				RAW.WATCH ? ModuleEssentials.push(...response.essentials) : fileData.essentials.push(...response.essentials);
			} else if (!response.isDuplicate) {
				fileData.usedIndexes.add(response.index);
				indexSkeleton[response.selector] = response.skeleton;
				portableCount++;
			}
		});
		collection[filePath] = indexSkeleton;
		const classNames = Object.keys(indexSkeleton);
		if (classNames.length)
			portableChart[`Portable [${fileData.filePath}]: ${classNames.length} Classes`] = classNames;
		return collection
	}, {});

	const BindingStyleSkeleton = bindingArray.reduce((collection, fileData) => {
		const result = PARSE.CSSLIBRARY([fileData], "BINDING", true);
		collection[NAV.folder.portables + "/" + fileData.filePath] = result;
		const selectors = Object.keys(result);
		if (selectors.length)
			bindingChart[`Binding [${fileData.filePath}]: ${selectors.length} Classes`] = selectors;
		bindingCount += selectors.length;
		return collection;
	}, {});


	const AxiomStyleSkeleton = axiomsArray.reduce((collection, fileData, index) => {
		const result = PARSE.CSSLIBRARY(fileData, "AXIOM");
		collection[index] = result;
		const selectors = Object.keys(result);
		if (selectors.length)
			axiomChart[`Level ${index}: ${selectors.length} Classes`] = selectors;
		axiomCount += selectors.length;
		return collection;
	}, {});

	const ClusterStyleSkeleton = clustersArray.reduce((collection, level, index) => {
		const result = PARSE.CSSLIBRARY(level, "CLUSTER");
		collection[index] = result;
		const selectors = Object.keys(result);
		if (selectors.length)
			clusterChart[`Level ${index}: ${selectors.length} Classes`] = selectors;
		clusterCount += selectors.length;
		return collection;
	}, {});

	Object.values(CACHE.PortableStyle2Index).forEach((index) => {
		const InStash = INDEX.STYLE(index);
		if (InStash.declarations.length > 1)
			warnings.push(
				$.MOLD.warning.List(
					"Multiple portable declarations: " + InStash.selector,
					InStash.declarations,
					$.list.text.Bullets,
				),
			);
	});

	Object.values(CACHE.LibraryStyle2Index).forEach((index) => {
		const InStash = INDEX.STYLE(index);
		if (InStash.declarations.length > 1)
			warnings.push(
				$.MOLD.warning.List(
					"Multiple Library declarations: " + InStash.selector,
					InStash.declarations,
					$.list.text.Bullets,
				),
			);
	});

	report = [
		$.MOLD.primary.Section(
			`Axiom Styles: ${axiomCount}`,
			Object.entries(axiomChart).map(([heading, entries]) =>
				$.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries),
			),
		),
		$.MOLD.primary.Section(
			`Cluster Styles: ${clusterCount}`,
			Object.entries(clusterChart).map(([heading, entries]) =>
				$.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries),
			),
		),
		$.MOLD.primary.Section(
			`Binding Styles: ${bindingCount}`,
			Object.entries(bindingChart).map(([heading, entries]) =>
				$.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries),
			),
		),
		$.MOLD.primary.Section(
			`Portable Styles: ${portableCount}`,
			Object.entries(portableChart).map(([heading, entries]) =>
				$.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries),
			),
		),
	].join("");

	return {
		libraryTable,
		modulesTable,
		ModuleEssentials,
		AxiomStyleSkeleton,
		ClusterStyleSkeleton,
		BindingStyleSkeleton,
		PortableStyleSkeleton,
	};
}


function Report() {
	const readmeFiles = {}, xtylingMap = {}, bindingMap = {}, nameCollitions = [], essentials = [];

	if (!RAW.WATCH) {
		Object.values(STACK.PORTABLES).forEach((F) => {
			if (RAW.PACKAGE === F.fileName)
				nameCollitions.push(F.sourcePath);
			if (F.extension === "md") {
				if (!readmeFiles[F.fileName]) readmeFiles[F.fileName] = F.content;
				else readmeFiles[F.fileName] += "\n\n" + F.content;
			} else if (F.extension === "xcss") {
				if (xtylingMap[F.fileName]) F.usedIndexes.forEach(i => xtylingMap[F.fileName].push(i));
				else xtylingMap[F.fileName] = Array.from(F.usedIndexes);
			} else if (F.extension === "css") {
				if (bindingMap[F.fileName]) F.usedIndexes.forEach(i => bindingMap[F.fileName].push(i));
				else bindingMap[F.fileName] = Array.from(F.usedIndexes);
			}
		});

		if (nameCollitions.length)
			warnings.push($.MOLD.warning.List(`Package-name collitions: ${RAW.PACKAGE}`, nameCollitions, $.list.tertiary.Bullets))
	}

	return {
		readmeFiles,
		xtylingMap,
		bindingMap,
		essentials,
		warnings,
		report,
	};
}

export default {
	ReRender,
	Report,
};
