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
