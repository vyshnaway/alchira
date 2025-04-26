function reader(string, searchFrom) {
    const startCh = '<';
    const endCh = '>';
    const splitCh = ' ';
    const assignCh = '=';
    const escapeChs = ']})`\\/';

    const combinatorChs = `{}()[]'"`
    const skipChs = '\n `' + combinatorChs + splitCh + assignCh + endCh + startCh;
    console.log(skipChs)
    let marker = searchFrom;
    let ch = string[marker++];
    let startIndex = searchFrom;
    let escape = searchFrom;

    let tagObj = {};
    let deviance = 0;
    let combinator = "-";
    let tagParseReq = false;
    let attrStart = false,
        valueStart = false,
        propEnded = false,
        attrStartMarker = searchFrom,
        attrEndMarker = searchFrom,
        attrStartMarkerX = searchFrom,
        attrEndMarkerX = searchFrom,
        valueStartMarker = searchFrom,
        valueEndMarker = searchFrom

    while (ch !== undefined) {
        if ((escapeChs.includes(ch)) && deviance) escape = startIndex;

        if (startIndex > escape) {
            tagParseReq = (!deviance && ('$#@'.includes(ch)));

            if (!deviance || (combinator.includes(ch))) {
                switch (ch) {
                    case '(': combinator = "()"; deviance++; break;
                    case '{': combinator = "{}"; deviance++; break;
                    case '[': combinator = "[]"; deviance++; break;
                    case ')': case '}': case ']': deviance--; break;
                    case "'": case '"': case '`':
                        if (combinator === ch) {
                            deviance = 0;
                        } else {
                            combinator = ch;
                            deviance = 1;
                        } break;
                }
                if (!deviance) {
                    combinator = "-";
                    if (valueStart) {
                        valueEndMarker = marker - 1;
                        propEnded = true;
                        valueStart = false;
                    }

                    if (!skipChs.includes(ch)) {
                        // attrEndMarkerX = attrEndMarker;
                        attrStartMarkerX = attrStartMarker;
                        attrEndMarker = marker;
                        if (!attrStart) {
                            attrStartMarker = marker;
                            attrStart = true;
                        }
                    };
                    console.log(`${ch} || ${marker} || ${attrStartMarker} ||X ${attrStartMarkerX} || ${attrEndMarker} ||X ${attrEndMarkerX} || ${valueStartMarker} || ${valueEndMarker}`)
                    if (propEnded) {
                        console.log(string.slice(valueStartMarker, valueEndMarker))
                        if (tagObj.element === '') {
                            tagObj.element = string.slice(attrStartMarkerX, attrEndMarkerX)
                        }
                        else if (valueStartMarker > attrEndMarkerX) {
                            tagObj.attributes[string.slice(attrStartMarkerX, attrEndMarkerX)]
                                = string.slice(valueStartMarker, valueEndMarker)
                        }
                        else {
                            tagObj.properties.push(string.slice(attrStartMarkerX, attrEndMarkerX));
                        }
                        console.log(tagObj)
                        attrStart = false;
                        propEnded = false;
                    }
                } else {
                    valueStart = true;
                    valueStartMarker = marker
                }
            }

            if (!deviance && (ch === endCh)) break;
        }
        else if (ch === startCh) {
            deviance = 0;
            propEnded = false;
            startIndex = marker;
            valueStart = false;
            attrStart = false;
            tagObj = {
                element: '',
                attributes: { class: '' },
                properties: [],
            }
        }
        ch = string[marker++];
    }

    const tagString = (string.slice(startIndex, marker - 1));
    return {
        contentBefore: string.slice(searchFrom, startIndex - 1),
        tagString,
        tagObj,
        tagParseReq,
        exitValid: !deviance && Boolean(ch),
        startsFrom: startIndex,
        endsAt: marker,
        tagLength: tagString.length,
    };
}
function writer(string, searchFrom) {
    const startCh = '<';
    const endCh = '>';
    const splitCh = ' ';
    const assignCh = '=';
    const escapeChs = ']})`\\/';

    const combinatorChs = `{}()[]'"`
    const skipChs = '\n `' + combinatorChs + splitCh + assignCh + endCh + startCh;
    console.log(skipChs)
    let marker = searchFrom;
    let ch = string[marker++];
    let startIndex = searchFrom;
    let escape = searchFrom;

    let tagObj = {};
    let deviance = 0;
    let combinator = "-";
    let tagParseReq = false;
    let propEnded = false;

    while (ch !== undefined) {
        if ((escapeChs.includes(ch)) && deviance) escape = startIndex;

        if (startIndex > escape) {
            tagParseReq = (!deviance && ('$#@'.includes(ch)));

            if (!deviance || (combinator.includes(ch))) {
                switch (ch) {
                    case '(': combinator = "()"; deviance++; break;
                    case '{': combinator = "{}"; deviance++; break;
                    case '[': combinator = "[]"; deviance++; break;
                    case ')': case '}': case ']': deviance--; break;
                    case "'": case '"': case '`':
                        if (combinator === ch) {
                            deviance = 0;
                        } else {
                            combinator = ch;
                            deviance = 1;
                        } break;
                }
            }

            if (!deviance && (ch === endCh)) break;
        }
        else if (ch === startCh) {
            deviance = 0;
            propEnded = false;
            startIndex = marker;
            tagObj = {
                element: '',
                attributes: { class: '' },
                properties: [],
            }
        }
        ch = string[marker++];
    }

    const tagString = (string.slice(startIndex, marker - 1));
    return {
        contentBefore: string.slice(searchFrom, startIndex - 1),
        tagString,
        tagObj,
        tagParseReq,
        exitValid: !deviance && Boolean(ch),
        startsFrom: startIndex,
        endsAt: marker,
        tagLength: tagString.length,
    };
}

export default {
    reader,
    writer
} 

const script = ` > parvanendu <   h2 class = "text-2xl font-semibold" difer [dox!!!] href='#'>About</h2>nihilim <uik>`
console.log(scriptRider.ride(script, 0))
// console.log(styleRider.ride(style, 0))

