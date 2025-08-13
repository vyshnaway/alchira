import {
    _styleSwitch
} from "./forge.js";

console.log(_styleSwitch({
    a: {
        "": "",
        "body[]": "",
        "@media (max-width=4567)": "",
        "@media (min-width=2345)": "",
        "@media (min-width=1234)": "",
        "@media (max-width=3456)": "",
    },
    b: {
        "": "",
        "@media (max-width=4567)": "",
        "@media (min-width=2345)": "",
        "@media (min-width=1234)": "",
        "@media (max-width=3456)": "",
        "body[]": "",
    }
}));