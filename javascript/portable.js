
// import Use from "../Utils/index.js";
// import FORGE from "./forge.js";
// import { CACHE } from "../data-cache.js";
// import { INDEX } from "../data-set.js";

// function portableCreator(
//     preBinds = [],
//     postBinds = [],
//     essentials = [],
//     module = "module",
//     version = "0.0.0",
// ) {
//     const bindstack = {}, tab = "    ", portable = [`# ${module}@${version}`], binding = [];
//     const bindingResponse = FORGE.bindIndex(new Set(preBinds), new Set(postBinds), true);

//     Object.entries(CACHE.GlobalsStyle2Index).forEach(([selector, index]) => {
//         const style = INDEX.OBJECT(index);
//         bindstack[selector] = FORGE.bindIndex(new Set(style.preBinds), new Set(style.postBinds), true);
//     });

//     const classList = Object.keys(CACHE.GlobalsStyle2Index);
//     portable.push(
//         "", `## Xtyle Classes (${classList.length})`, "",
//         ...classList.map((c) => "- `" + c + "`"), "---",
//     );
//     [
//         ...Object.entries(CACHE.GlobalsStyle2Index).map(([selector, index]) => [selector, INDEX.OBJECT(index).object]),
//         ...bindingResponse.postBindsObject, ...bindingResponse.preBindsObject,
//     ].forEach(([selector, object]) => {
//         portable.push(
//             "", `### Selector: \`${selector}\``, "",
//             "````html",
//             "<xtyle",
//             ...Object.entries(object).reduce((accum, [subSelector, block]) => {
//                 if (subSelector === "") {
//                     accum.push(
//                         `${selector}="`,
//                         tab + `@pre-bind ${bindstack[selector].preBindsList.join(" ")}; `,
//                         tab + `@post-bind ${bindstack[selector].postBindsList.join(" ")}; `,
//                         ...rawCompose(Object.entries(block), tab).map(
//                             (line) => tab + line,
//                         ),
//                         '"',
//                     );
//                 } else {
//                     if (subSelector[0] === "@") {
//                         const ind = subSelector.indexOf(" ");
//                         const rule = subSelector.slice(1, ind);
//                         const query = subSelector.slice(ind + 1);

//                         subSelector = `${rule}@{${query}}`;
//                     }
//                     accum.push(
//                         `${subSelector}="`,
//                         ...rawCompose(Object.entries(block), tab).map(
//                             (line) => tab + line,
//                         ),
//                         '"',
//                     );
//                 }
//                 return accum;
//             }, []).map((line) => tab + line),
//             "/>",
//             "````",
//         );
//     });

//     portable.push(
//         "",
//         "## Portable Essentials",
//         "",
//         "````html",
//         "<xtyle",
//         ...essentials
//             .reduce((accum, [subSelector, block]) => {
//                 if (subSelector[0] === "@") {
//                     const ind = subSelector.indexOf(" ");
//                     const rule = subSelector.slice(1, ind);
//                     const query = subSelector.slice(ind + 1);

//                     subSelector = `${rule}@{${query}}`;
//                 }
//                 accum.push(
//                     `${subSelector}="`,
//                     ...rawCompose(Object.entries(block), tab).map((line) => tab + line),
//                     '"',
//                 );
//                 return accum;
//             }, [])
//             .map((line) => tab + line),
//         "/>",
//         "````",
//     );

//     return {
//         portable: portable.join("\n"),
//         binding: binding.join("\n"),
//     };
// }


export default function GeneratePortable(STASH, preBinds, postBinds, bindingMap, xtylingMap) {

    // 		const portableMd = NAV.folder.portableBundle + "/" + RAW.PACKAGE + ".css",
    // 			portableCss = NAV.folder.portableBundle + "/" + RAW.PACKAGE + ".xcss",
    // 			portableXcss = NAV.folder.portableBundle + "/" + RAW.PACKAGE + ".md";

    // 		const portable = COMPILE.Portable(
    // 			PREBINDS,
    // 			POSTBINDS,
    // 			CUMULATES.essentials,
    // 			RAW.PACKAGE,
    // 			RAW.VERSION,
    // 		);
    // 		SAVEFILES[NAV.folder.portableNative + "/" + RAW.PACKAGE + ".css"] =
    // 			portable.binding;
    // 		SAVEFILES[NAV.folder.portableNative + "/" + RAW.PACKAGE + ".xcss"] =
    // 			portable.portable;
    // 		SAVEFILES[NAV.folder.portableNative + "/" + RAW.PACKAGE + ".md"] =
    // 			RAW.ReadMe;

    // 		readmeFiles = { [`${RAW.PACKAGE}.md`]: `# ${RAW.PACKAGE}@${RAW.VERSION}` + "\n---\n" + RAW.ReadMe };
    // 		if (SAVEFILES[portableMd]) SAVEFILES[portableMd] += RAW.ReadMe;
    // 		else SAVEFILES[portableMd] = RAW.ReadMe;
    // 		if (SAVEFILES[portableCss]) SAVEFILES[portableCss] += portable.binding;
    // 		else SAVEFILES[portableCss] = portable.binding;
    // 		if (SAVEFILES[portableXcss]) SAVEFILES[portableXcss] += portable.portable;
    // 		else SAVEFILES[portableXcss] = portable.portable;
} 