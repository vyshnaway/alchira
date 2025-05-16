export default function buildBinds(preBinds = new Set(), postBinds = new Set(), index, refers) {
    let preLast = preBinds.size, postLast = postBinds.size;
    // console.log(index)
    do {
        preBinds.forEach(element => {
            // console.log("--> ", element)
            if (refers[element]) {
                // console.log(index[refers[element]])
                index[refers[element]].preBinds.forEach(E => { if (!preBinds.has(E)) preBinds.add(E) })
            }
        });
        postBinds.forEach(element => {
            // console.log("--> ", element)
            if (refers[element]) {
                // console.log(index[refers[element]])
                index[refers[element]].postBinds.forEach(E => { if (!postBinds.has(E)) postBinds.add(E) })
            }
        });
    } while (!(preLast === preBinds.size) && (postLast === preBinds.size))

    preBinds.forEach(element => { if (postBinds.has(element)) preBinds.delete(element) })

    return { preBinds: Array.from(preBinds), postBinds: Array.from(postBinds) }
}