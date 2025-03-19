import unload from './1.style-proxy.js'

function substitute(op, parameters, suffixes) {
    let string, isNestedArray = false;
    switch (op) {
        case '<<': string = `.parentNode`; break;
        case '<$': string = `.parentNode.firstChild`; break;
        case '>$': string = `.parentNode.lastChild`; break;
        case '+$': string = `.previousSibling`; break;
        case '-$': string = `.nextSibling`; break;
        case '*$': string = `.parentNode.children`; isNestedArray = true; break;

        case '<>': string = `.firstChild`; break;
        case '>>': string = `.lastChild`; break;
        case '*>': string = `.children`; isNestedArray = true; break;

        case '<': string = `.closest(${parameters})`; break;
        case '$': string = `.parentNode.querySelector(${parameters})`; break;
        case '>': string = `.querySelector(${parameters})`; break;
        case '*': string = `.querySelectorAll(${parameters})`; isNestedArray = true; break;

        case '+': string = `; newNode.classList.add(${parameters})`; break;
        case '-': string = `; newNode.classList.remove(${parameters})`; break;
        case '!': string = `; newNode.classList.toggle(${parameters})`; break;

        default: string = `.${op}(${parameters})`; break;
    }

    // Handle suffixes and nested arrays properly
    if (isNestedArray) {
        if (suffixes.length) {
            return `\n.reduce((newNodes, node) => { const newNode = Array.from(node${string}); return newNodes.push(...newNode.slice(${suffixes.join(',')})) && newNodes; }, [])`;
        }
        return `\n.reduce((newNodes, node) => { const newNode = Array.from(node${string}); return newNodes.push(...newNode) && newNodes; }, [])`;
    } else {
        return `\n.reduce((newNodes, node) => { const newNode = node${string}; return newNodes.push(newNode) && newNodes; }, [])`;
    }
}

export default function enchant(spell) {
    spell = unload(spell)
    // Avoid adding an extra dot that could cause incomplete operations
    let executor = '',
        paramsDeviance = 0,
        suffixDeviance = 0,
        length = spell.length,
        startMarker = 0,
        endMarker = 0,
        paramStart = 0,
        suffixStart = 0,
        parameters = [],
        suffixes = [],
        opEnded = false;

    for (let index = 0; index < length; index++) {
        const ch = spell[index];
        if (ch === '(' && !suffixDeviance) paramsDeviance++;
        if (ch === '[' && !paramsDeviance) suffixDeviance++;

        if (paramsDeviance === 0 && suffixDeviance === 0) {
            if (ch === '.') {
                if (startMarker) {
                    executor += substitute(spell.slice(startMarker, endMarker).trim(), parameters.join(','), suffixes);
                    parameters = [];
                    suffixes = [];
                } else {
                    switch (spell.slice(startMarker, index).trim()) {
                        case '^': executor = '[this]'; break;
                        case '*': executor = '[document]'; break;
                        default: executor = '[document]'; // Default to document if no valid start
                    }
                }
                opEnded = false;
                startMarker = index + 1;
            }
            if (!opEnded) endMarker = index + 1;
        } else if (paramsDeviance > 0 || suffixDeviance > 0) {
            opEnded = true;
            if (ch === '(' && paramsDeviance === 1) paramStart = index + 1;
            if (ch === '[' && suffixDeviance === 1) suffixStart = index + 1;
            if (ch === ')' && paramsDeviance === 1 && !suffixDeviance) {
                parameters.push(spell.slice(paramStart, index).trim());
                paramStart = index + 1;
            }
            if (ch === ']' && suffixDeviance === 1 && !paramsDeviance) {
                suffixes.push(spell.slice(suffixStart, index).trim());
                suffixStart = index + 1;
            }
        }

        if (ch === ')' && !suffixDeviance) paramsDeviance--;
        if (ch === ']' && !paramsDeviance) suffixDeviance--;
    }

    // Handle the last operation if there’s anything left
    if (startMarker && startMarker < length) {
        executor += substitute(spell.slice(startMarker, endMarker).trim(), parameters.join(','), suffixes);
    }

    return executor;
}

// Test the corrected code
// console.log(wizard("*.<$.>$.+$.-$.+('hide','gd').*('$')[203, 204].*('$')") + '\n');
// console.log(wizard("*.<$.>$.+$.-$.+('hide','gd').*('$')[203].*('$')") + '\n');