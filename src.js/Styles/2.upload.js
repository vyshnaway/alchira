import STYLES from "./0.styles.js"
import parse from "./Workers/style-block/0.parse.js"

const styleLibibDetect = /^.*(?=\$)/
const rulesLibDetect = /^.*(?=\@)/

let ACTIONS = {
    FILE: {
        STYLES: (fileContents) => {
            const microFiles = []
            const macroFiles = []
            const libFiles = []
            const libGroup = {}

            Object.keys(fileContents).forEach((file) => {
                const library = file.match(styleLibibDetect)[0];
                switch (library) {
                    case null: microFiles.push(file);
                        break;
                    case '': macroFiles.push(file);
                        break;
                    default: libFiles.push(file);
                        libGroup[file] = library;
                        break;
                }
            })

            // styles.list.micro = ;
            // styles.list.macro = ;
            // styles.list.library = ;
        },
        RULES: (fileContents) => {
            const microFiles = []
            const macroFiles = []
            const libFiles = []
            const libGroup = {}

            Object.keys(fileContents).forEach((file) => {
                const library = file.match(rulesLibDetect)[0];
                switch (library) {
                    case null: microFiles.push(file);
                        break;
                    case '': macroFiles.push(file);
                        break;
                    default: libFiles.push(file);
                        libGroup[file] = library;
                        break;
                }
            })

            // ACTIONS.list.micro = microFiles.forEach(file => {
            //     parse(fileContents[file],)
            // });
            // styles.list.macro = ;
            // styles.list.library = ;
        },
    },
    XTYLE: (xtyle, conte) => {

    }
}

export default ACTIONS;
