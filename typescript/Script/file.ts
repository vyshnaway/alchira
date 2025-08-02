import tagReader from "./tag.js";

export const FileCursor = {
	marker: 0,
	rowMarker: 0,
	colMarker: 0,
	tagCount: 0,
};
export const StyleStack = { Portable: {}, Library: {}, Native: {}, Local: {}, Global: {} };
export const BindStack = { preBinds: new Set(), postBinds: new Set() };

export default function scanner(
	fileData,
	classProps = [],
	action = "read",
	bindStack = { preBinds: new Set(), postBinds: new Set() },
	styleStack = { Portable: {}, Library: {}, Native: {}, Local: {}, Global: {} },
) {
	Object.assign(StyleStack, styleStack);
	Object.assign(BindStack, bindStack);
	FileCursor.tagCount = 1;
	FileCursor.rowMarker = 1;
	FileCursor.colMarker = 1;
	FileCursor.marker = 0;
	const stylesList = [],
		classesList = [];
	let ch = fileData.content[0],
		scribed = "";

	fileData.summon = false;
	while (FileCursor.marker < fileData.content.length) {
		if (ch === "\n") {
			FileCursor.rowMarker++;
			FileCursor.colMarker = 0;
		} else FileCursor.colMarker++;

		if (fileData.content[FileCursor.marker - 1] !== "\\" && ch === "<") {
			FileCursor.tagCount++;
			const response = tagReader(
				fileData.content,
				action,
				classProps,
				fileData,
			);
			if (response.ok) {
				if (Object.keys(response.styleObject.styles).length > 0)
					stylesList.push(response.styleObject);
				if (response.classList.length) classesList.push(response.classList);
			}
			scribed += response.content;
		} else {
			scribed += ch;
			FileCursor.marker++;
		}

		ch = fileData.content[FileCursor.marker];
	}

	return { scribed, classesList, stylesList };
}
