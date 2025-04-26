import shorthandJS from "./shorthand.js";

const data = {
    "DesignApproach": "#MobileFirst",
    "MobileFirst": "min-width",
    "DesktopFirst": "max-width",
    "Ms4": "media@({#DesignApproach}:0320px)",
    "Ms3": "media@({#DesignApproach}:0384px)",
    "Ms2": "media@({#DesignApproach}:0448px)",
    "Ms1": "media@({#DesignApproach}:0512px)",
    "Mmd": "media@({#DesignApproach}:0640px)",
    "Ml1": "media@({#DesignApproach}:0768px)",
    "Ml2": "media@({#DesignApproach}:0896px)",
    "Ml3": "media@({#DesignApproach}:1024px)",
    "Ml4": "media@({#DesignApproach}:1152px)",
    "Cs4": "container@({#DesignApproach}:160px)",
    "Cs3": "container@({#DesignApproach}:192px)",
    "Cs2": "container@({#DesignApproach}:224px)",
    "Cs1": "container@({#DesignApproach}:256px)",
    "Cmd": "container@({#DesignApproach}:320px)",
    "Cl1": "container@({#DesignApproach}:384px)",
    "Cl2": "container@({#DesignApproach}:449px)",
    "Cl3": "container@({#DesignApproach}:512px)",
    "Cl4": "container@({#DesignApproach}:576px)"
}
const SH = (await shorthandJS.UPLOAD(data)).list

console.log(shorthandJS.RENDER("#Cs2$:hover"))
console.log(shorthandJS.RENDER("$:hover"))
console.log(SH)

