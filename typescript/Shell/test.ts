import * as root from "./0.root.js";
import $ from "./main.js";

$.POST($.MAKE(
    $.tag.H2("Style Previews"),
    Object.entries(root.style).map(([k, v]) => root.fmt(k, v)),
    [$.list.Catalog, 0, []]
));


// [
// 	Bullets,
// 	Numbers,
// 	Level,
// 	Paragraphs,
// 	Breaks,
// 	Catalog
// ].forEach((Fn: (items: string[], intent: number, preset:string[], ...styles: string[]) => string[]) => {
// 	console.log(Fn([
// 		'asdfafdsfs',
// 		"df dfa",
// 		"gbhd",
// 		'asdfafdsfs',
// 		"df dfa",
// 		"gbhd",
// 		'asdfafdsfs',
// 		"df dfa",
// 		"gbhd",
// 		'asdfafdsfs',
// 		"df dfa",
// 		"gbhd",
// 		'asdfafdsfs',
// 		"df dfa",
// 		"gbhd",
// 		'asdfafdsfs',
// 		"df dfa",
// 		"gbhd",
// 		'asdfafdsfs',
// 		"df dfa",
// 		"gbhd",
// 		'asdfafdsfs',
// 		"df dfa",
// 		"gbhd",
// 		'asdfafdsfs',
// 		"df dfa",
// 		"gbhd",
// 		'asdfafdsfs',
// 		"df dfa",
// 		"gbhd",
// 		'asdfafdsfs',
// 		"df dfa",
// 		"gbhd",
// 		'asdfafdsfs',
// 		"df dfa",
// 		"gbhd",
// 	], 1, root.style.TB_Normal_Yellow).join("\n"));
// 	console.log("---");
// });