import { lists, stash, env } from "../executor.js"

export default function classExtract(string, proxyLoad) {
    let marker = 0,
        ch = string[marker],
        quotes = ["'", "`", '"'],
        activeQuote = "",
        active = false,
        entry = "",
        classList = [],
        collection = [],
        proxy = "";

    while (ch !== undefined) {

        if (ch === activeQuote) {
            proxy += (proxyLoad ? "entry" : entry) + ch
            active = false;
            if (stash.styleRefers[entry]) {
                classList.push(entry);
                if (env.devMode && proxyLoad) {

                }
            }
            activeQuote = "";
            entry = ""
        } else if (active) {
            if (ch === " ") {
                proxy += (proxyLoad ? "entry" : entry) + ch;
                if (stash.styleRefers[entry]) {
                    classList.push(entry);
                    if (env.devMode && proxyLoad) {

                    }
                }
                entry = ""
            } else entry += ch
        } else {
            proxy += ch;
            if (quotes.includes(ch)) {
                active = true;
                activeQuote = ch;
            }
        }

        ch = string[++marker];
    }

    return { classList, proxy, collection }
}
