import Use from "../Utils/main.js";

const OPEN_CHARS = ["{", "[", "("];
const CLOSE_CHARS = ["}", "]", ")"];
const QUOTE_CHARS = ["`", "'", '"'];

interface t_Result {
	compose: string[],
	preBinds: string[],
	postBinds: string[],
	variables: Record<string, string>,
	XatProps: [string, string][],
	atProps: Record<string,string>,
	Xproperties: [string, string][],
	properties: Record<string,string>,
	XatRules: [string, string][],
	atRules: Record<string,string>,
	Xnested: [string, string][],
	nested: Record<string, string>,
	Xclasses: [string, string][],
	classes: Record<string, string>,
	Xflats: [string, string][],
	flats: Record<string,string>,
	XallBlocks: [string, string][],
	allBlocks: Record<string,string>,
}

export default function parseBlock(content: string, blockArrays = false) {
	content += ";";
	const length = content.length;

	let keyStart = 0,
		valStart = 0,
		deviance = 0,
		quote = "",
		key = "",
		isProp = true;

	const result: t_Result = {
		compose: [],
		preBinds: [],
		postBinds: [],
		variables: {},
		XatProps: [],
		atProps: {},
		Xproperties: [],
		properties: {},
		XatRules: [],
		atRules: {},
		Xnested: [],
		nested: {},
		Xclasses: [],
		classes: {},
		Xflats: [],
		flats: {},
		XallBlocks: [],
		allBlocks: {},
	};

	for (let index = 0; index < length; index++) {
		const ch = content[index];
		if (ch === "\\") {
			index++;
			continue;
		}
		if (QUOTE_CHARS.includes(ch)) {
			if (quote === "") {
				quote = ch;
			} else if (quote === ch) {
				quote = "";
			}
		}

		if (quote === "") {
			if (CLOSE_CHARS.includes(ch)) { deviance--; }

			if (deviance === 0) {
				switch (ch) {
					case "{":
						isProp = false;
						key = Use.string.minify(content.slice(keyStart, index));
						valStart = index + 1;
						break;
					case ":":
						key = Use.string.minify(content.slice(keyStart, index));
						valStart = index + 1;
						break;
					case "}":
					case ";": {
						const value = Use.string.minify(content.slice(valStart, index));
						if (isProp) {
							if (key.length > 0) {
								if (key.startsWith("--")) {result.variables[key] = value;}
								result.properties[key] = value;
								if (blockArrays) {result.Xproperties.push([key, value]);}
							} else if (value[0] === "@") {
								const firstSpaceIndex = value.indexOf(" ");
								const spaceIndex =
									firstSpaceIndex < 0 ? value.length : firstSpaceIndex;
								const directive = value.slice(0, spaceIndex);

								switch (directive) {
									case "@--pre-bind":
										result.preBinds.push(
											...Use.string.zeroBreaks(value.slice(spaceIndex)),
										);
										break;
									case "@--post-bind":
										result.postBinds.push(
											...Use.string.zeroBreaks(value.slice(spaceIndex)),
										);
										break;
									case "@--compose":
										result.compose.push(
											...Use.string.zeroBreaks(value.slice(spaceIndex)),
										);
										break;
									default:
										result.atProps[value] = "";
										if (blockArrays) {result.XatProps.push([value, ""]);}
								}
							} else {
								const breaks = Use.string.zeroBreaks(value);
								switch (breaks[0]) {
									case "<":
										breaks.shift();
										result.preBinds.push(...breaks);
										break;
									case ">":
										breaks.shift();
										result.postBinds.push(...breaks);
										break;
									case "+":
										breaks.shift();
										result.compose.push(...breaks);
										break;
								}
							}
						} else {
							switch (key[0]) {
								case "@":
									result.atRules[key] = value;
									if (blockArrays) {result.XatRules.push([key, value]);}
									break;
								case "&":
									result.nested[key] = value;
									if (blockArrays) {result.Xnested.push([key, value]);}
									break;
								case ".":
									result.classes[key] = value;
									if (blockArrays) {result.Xclasses.push([key, value]);}
									break;
								default:
									result.flats[key] = value;
									if (blockArrays) { result.Xflats.push([key, value]); }
							}
							result.allBlocks[key] = value;
							if (blockArrays) { result.XallBlocks.push([key, value]); }
						}
						keyStart = index + 1;
						valStart = index + 1;
						key = "";
						isProp = true;
					}
				}
			}

			if (OPEN_CHARS.includes(ch)) { deviance++; }
		}
	}

	return result;
}
