function minify(string) {
    const length = string.length;
    const result = [];
    let lastCh = ' ';

    for (let i = 0; i < length; i++) {
        const ch = (string[i] === '\n') ? ' ' : string[i];

        if (ch === ' ' && lastCh !== ' ') {
            result.push(ch);
        } else if (ch !== ' ') {
            result.push(ch);
        }
        lastCh = ch;
    }
    if (result.length > 0 && lastCh === ' ') {
        result.pop();
    }
    return result.join('');
}

export default function parse(string) {
    let keyStart = 0,
        valStart = 0,
        deviance = 0,
        quote = '',
        key = '',
        length = string.length,
        styleObject = { '': {} };

    for (let index = 0; index < length; index++) {
        const ch = string[index];
        if (ch === '\\') {
            index++;
            continue;
        }
        if (`\`\'\"`.includes(ch)) {
            if (quote === '') {
                quote = ch;
            } else if (quote === ch) {
                quote = ''
            }
        }

        if (quote === '') {
            if ("}" === ch) deviance--;

            if (!deviance) {
                switch (ch) {
                    case '{':
                        key = minify(string.slice(keyStart, index));
                        valStart = index + 1;
                        break;
                    case '}':
                    case ';':
                        if (key !== '' && ch === '}') {
                            if (key[0] === '@') {
                                styleObject[key] = parse(string.slice(valStart, index))['']
                            } else {
                                key = extract.className(key)
                                if (key !== '') {
                                    const block = getBlock(string.slice(valStart, index), false, true, true, false, false);
                                    styleObject[''][key] = { ...block.props, ...block.nests }
                                }
                            }
                        }
                        keyStart = index + 1;
                        valStart = index + 1;
                        key = '';
                }
            }

            if ("{" === ch) deviance++;
        }
    }
    return styleObject;
}
