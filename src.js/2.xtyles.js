const libDetect = /^.*(?=\$)/

let styles = {
    list: {
        micro: {},
        macro: {},
        global: {},
        local: {},
        library: {},
    },
    ADDCSS: (source, content) => {
        switch (source.match(libDetect)) {
            case null:
                break;
            case '':
                break;
            default:
                break;
        }
    },
    ADDSTYLE: (source, conte) => {

    }
}

console.log("dfd".match(libDetect))
console.log("d$fd".match(libDetect))
console.log("$dfd".match(libDetect))