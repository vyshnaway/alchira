export default function renderAtRule(string) {
    let result = ['@'],
        length = string.length,
        deviance = 0;

    for (let i = 0; i < length; i++) {
        let ch = string[i];
        if ("({".includes(ch)) deviance++;
        if (")}".includes(ch)) deviance--;
        if (deviance) {
            switch (ch) {
                case '{': result.push(''); break;
                case '|': result.push('or'); break;
                case '&': result.push('and'); break;
                case '!': result.push('not'); break;
                case '*': result.push('all'); break;
                case '^': result.push('only'); break;
                default: result.push(ch);
            }
        } else {
            switch (ch) {
                case '}': result.push(''); break;
                case '@': result.push(' '); break;
                case ',': result.push(', '); break;
                case '|': result.push(' or '); break;
                case '&': result.push(' and '); break;
                case '!': result.push('not '); break;
                case '*': result.push('all '); break;
                case '^': result.push('only '); break;
                default: result.push(ch);
            }
        }
    }

    return result.join('');
}

// console.log(renderLazyhand('media@(min-width : 67px)'))
// console.log(renderLazyhand('media@(min-width : 67px)|screen'))
// console.log(renderLazyhand('media@{(width < 67px) | screen}'))
// console.log(renderLazyhand('media@^sreen&(width:67px)'))
