import { currentCrumb, currentFile, scriptText } from '../0.env.js'
import U from '../Utils/package.js'

// const match = /[a-z0-9]/i;

// function setCrumb(string) {
//     const length = string.length;
//     const result = [];

//     for (let i = 0; i < length; i++) {
//         const ch = string[i];
//         if (match.test(ch)) {
//             result.push(ch);
//         } else if (ch === '/') {
//             result.push('_');
//         } else {
//             result.push('-');
//         }
//     }

//     crumb = result.join('')
// }

export default function selectFile(path) {
    currentFile = path;
    currentCrumb = U.string.normalize(path);
    scriptText = U.file.readFromFile(path)
}