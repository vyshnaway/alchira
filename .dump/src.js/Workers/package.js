import codePreprocess from '../Utils/5.code.js'
import selectFile from './0.set-file.js'
import extractSelector from '../Inquire/2.extract.js'
import readCssBlock from './StyleBlock/0.block.js'
import switchObject from './4.switch.js'
import composeStyleBlock from './StyleBlock/1.compose.js'
import composeAdapterBlock from './StyleBlock/2.adapt.x.js'
import optimizeClassChain from './order/Algorithms/ODC.js'
import tagParsersForScript from "./8.tag.x.js";
import stylesheetActions from "./9.css.js";

export default {
    codePreprocess,
    selectFile,
    extractSelector,
    readCssBlock,
    switchObject,
    composeStyleBlock,
    composeAdapterBlock,
    optimizeClassChain,
    tagParsersForScript,
    stylesheetActions
}
