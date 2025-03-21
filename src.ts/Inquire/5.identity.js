const classNameRegex = /^\.([a-z0-9-_]+)$/i;
const nestSelectorRegex = /^\&.+$/i;
const keyFrameRegex = /^(from|to|[0-9]+%)$/i;

export default {
    ClassName: (string) => {
        const match = classNameRegex.exec(string);
        return match ? match[1] : '';
    },
    NestSelector: (string) => {
        const match = nestSelectorRegex.exec(string);
        return match ? match[0] : '';
    },
    KeyFrame: (string) => {
        const match = keyFrameRegex.exec(string);
        return match ? match[1] : '';
    },
};

// console.log(fn.className('.difj'))
// console.log(fn.className('.dic fj'))
// console.log(fn.className('dic fj'))
// console.log(fn.className(' .dicfj'))
 
// console.log(fn.nestSelector('&ghgh'))
// console.log(fn.nestSelector('& k:lo'))
// console.log(fn.nestSelector('&'))
// console.log(fn.nestSelector('&'))

// console.log(fn.keyFrame('.hi'))
// console.log(fn.keyFrame('from'))
// console.log(fn.keyFrame('from '))
// console.log(fn.keyFrame('50%'))