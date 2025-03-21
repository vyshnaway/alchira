import H from "./0.help.js"
import devOrder from "./1.dev.js"
import previewOrder from "./2.preview.js"
import buildOrder from "./3.build.js"

function dev() {

}
function preview() {

}
function build(classGroups) {
    const Nresult = H.createNumericArrays(classGroups)
    const order = buildOrder(Nresult.numericArrays);
    // console.log(Nresult)
    // console.log(order)
    return H.orderToClassList(Nresult.referenceSet, order)
}


// const input = [
//     ['a', 'g', 'h', 'd'],
//     ['a', 'k', 'h', 'g', 'v'],
//     ['m', 'n', 'a', 'g', 'v'],
//     ['m', 'u', 'a', 'v'],
//     ['y', 'k', 'a']
// ];
// console.log(build(input))


export default {
    dev,
    preview,
    build
}

// ['a', 'g', 'h', 'd']
// ['a', 'k', 'h', 'g', 'v']
// ['m', 'n', 'a', 'g', 'v']
// ['m', 'u', 'a', 'v']
// ['y', 'k', 'a']