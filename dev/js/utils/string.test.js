import fn from "./string.js";
const string = "  g f,d,, \n ghd  gfhsd ghn  g";
console.log(fn.minify(string) + "4");
console.log(fn.zeroBreaks(string));
console.log(fn.enCounter(64 * 64 * 12));
console.log(fn.enCounter(64 * 64 * 63));
console.log(fn.normalize("    g   ][\f,d,3425 ghd $\\ gfhsd ghn  g", ["\\", "$"]));
//# sourceMappingURL=string.test.js.map