const ALPHANUMERIC = /[a-z0-9]/gi;
const SPACE = /\s+/g;

const digits =
	"-0123456789_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const base = digits.length;

export default {
	normalize: (
		string = "",
		keepChars: string[] = [],
		skipChars: string[] = [],
		addBackSlashFor: string[] = [],
	) => {
		let final = "";
		string
			.replace(SPACE, "_")
			.split("")
			.forEach((ch) => {
				if (skipChars.includes(ch)) {return;}
				else if (addBackSlashFor.includes(ch)) {final += "\\" + ch;}
				else {
					final +=
						ch === "_"
							? "_"
							: keepChars.includes(ch)
								? ch
								: ch.match(ALPHANUMERIC)
									? ch
									: "-";
				}
			});
		return final;
	},
	minify: (string: string) => {
		const length = string.length;
		const result = [];
		let lastCh = " ";

		for (let i = 0; i < length; i++) {
			const ch =
				string[i] === "\n" || string[i] === "\r" || string[i] === "\t"
					? " "
					: string[i];

			if (ch === " " && lastCh !== " ") {
				result.push(ch);
			} else if (ch !== " ") {
				result.push(ch);
			}
			lastCh = ch;
		}
		if (result.length > 0 && lastCh === " ") {
			result.pop();
		}
		return result.join("");
	},
	zeroBreaks: (string: string, conditions = [" ", "\n", ","]) => {
		const length = string.length;
		const result = [];
		let start = 0;

		for (let i = 0; i < length; i++) {
			const ch = string[i];

			if (conditions.includes(ch)) {
				if (i > start) {
					result.push(string.substring(start, i));
				}
				start = i + 1;
			}
		}

		if (length > start) {
			result.push(string.substring(start, length));
		}

		return result;
	},
	enCounter: (number: number) => {
		let result = "",
			reminder = 0;

		while (number) {
			reminder = number % base;
			result = digits[reminder] + result;
			number = Math.floor(number / base);
		}
		return result;
	},
	stringMem: (string:string) => Number((string.length / 1024).toFixed(2)),
};
