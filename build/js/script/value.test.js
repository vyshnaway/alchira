// import { lists, stash, finals } from "../creator.js";
export {};
// export default function classExtract(string, action, fileData, shrad) {
//   let marker = 0,
//     ch = string[marker],
//     quotes = ["'", "`", '"'],
//     activeQuote = "",
//     inQuote = false,
//     entry = "",
//     classList = [],
//     collection = [],
//     scribed = "";
//   const metaFront = "_sh-" + shrad + fileData.metaFront;
//   while (ch !== undefined) {
//     if (inQuote) {
//       if (ch === " " || ch === activeQuote) {
//         if (action === "read") {
//           scribed += entry;
//           classList.push(entry);
//         } else {
//           const index =
//             (stash.styleRefers[entry] ?? 0) +
//             (stash.styleGlobals[entry] ?? 0) +
//             ((stash.styleLocals[fileData.filePath] &&
//               stash.styleLocals[fileData.filePath][entry]) ??
//               0);
//           if (index) {
//             switch (action) {
//               case "dev":
//                 const devClass =
//                   stash.indexStyles[index].scope +
//                   metaFront +
//                   stash.indexStyles[index].metaClass;
//                 scribed += devClass;
//                 finals["." + devClass] = index;
//                 break;
//               case "preview":
//                 break;
//               case "build":
//                 break;
//             }
//           } else scribed += entry;
//         }
//         scribed += ch;
//         entry = "";
//       } else entry += ch;
//       if (ch === activeQuote) {
//         inQuote = false;
//         activeQuote = "";
//       }
//     } else {
//       scribed += ch;
//       if (quotes.includes(ch)) {
//         inQuote = true;
//         activeQuote = ch;
//       }
//     }
//     ch = string[++marker];
//   }
//   return { classList, proxy: scribed, collection };
// }
//# sourceMappingURL=value.test.js.map