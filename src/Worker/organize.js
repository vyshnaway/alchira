import Utils from "../Utils/index.js";
import ODC from "./order.js"

export default function (arrays = [], CMD, KEY) {
    if (CMD === "build") {
        const response = ODC(arrays);
        return response;
    } else {
        return {
            status: true,
            result: Utils.array.setback(arrays.flat())
        };
    }
}