
// --- Initial Load ---

const RootBody = document.getElementById('live-preview-body');
const RootMain = document.getElementById('live-preview-main');
window.addEventListener('load', () => {
    setTimeout(() => {
        const scrollX = RootBody.scrollWidth * 0.5 - RootBody.clientWidth * 0.5;
        const scrollY = RootBody.scrollHeight * 0.5 - RootBody.clientHeight * 0.5;
        RootBody.scrollTo(scrollX, scrollY);
        RootBody.parentElement.removeAttribute("style", "");
    }, 100);
});


// --- Deploy Output Fragment ----

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const StapleElement = document.getElementById('live-preview-output-staple');
const OutputElement = document.getElementById('live-preview-output-container');
const SymClassNameElement = document.getElementById('live-preview-symclass');
const IndexStylesheetElement = document.getElementById('live-preview-project-index');
const WatchStylesheetElement = document.getElementById('live-preview-project-watch');

function refetchCSS() {
    const timestamp = new Date().getTime();
    [
        IndexStylesheetElement,
        WatchStylesheetElement
    ].forEach(link => {
        const href = link.getAttribute('href');
        const newHref = href.includes('?')
            ? href.replace(/(\?|&)t=\d+/, ('$1t=' + timestamp))
            : (href + '?t=' + timestamp);
        link.setAttribute('href', newHref);
    });
}

const OutputData = {
    staple: "",
    summon: "",
    symclass: "",
    attributes: "",
    watchclass: "",
}

const outputState = {
    useProjectCss: false,
    activateResize: false,
    preserveScale: false,
    activateDebug: false,
}


let OutputStyle = '';
function OutputUpdate(updateComponent = false) {

    if (OutputElement.hasAttribute('style')) { OutputStyle = OutputElement.getAttribute('style') ?? OutputStyle; }

    if (outputState.preserveScale) {
        OutputElement.setAttribute('style', OutputStyle);
    } else {
        if (outputState.activateResize && !OutputElement.hasAttribute('style')) { OutputElement.setAttribute('style', OutputStyle); }
        else if (!outputState.activateResize && OutputElement.hasAttribute('style')) { OutputElement.removeAttribute('style'); }
    }

    IndexStylesheetElement.disabled = !outputState.useProjectCss;
    OutputElement.setAttribute("data-live-preview-output-container-debug", String(outputState.activateDebug))
    OutputElement.setAttribute("data-live-preview-output-container-resize", String(outputState.activateResize))
    OutputElement.setAttribute("data-live-preview-output-container-preserve", String(outputState.preserveScale))

    refetchCSS();
    if (updateComponent) {

        const snippet = (typeof OutputData.staple === "string") ? OutputData.staple : '';
        const watchclass = (typeof OutputData.watchclass === "string") ? OutputData.watchclass : '';
        const structure = (typeof OutputData.summon === "string" && OutputData.summon.length) ? OutputData.summon : "{Content}";
        const selector = (typeof OutputData.symclass === "string" && OutputData.symclass.length) ? OutputData.symclass : '[N/A]';

        StapleElement.innerHTML = snippet;
        OutputElement.innerHTML = structure;
        OutputElement.className = watchclass;
        SymClassNameElement.innerText = selector;

        const attributes = JSON.parse(OutputData.attributes);
        if (typeof attributes === "object") {
            RootMain.setAttribute("style", typeof attributes["style"] === "string" ? attributes["style"].slice(1, -1) : "")
            Object.entries(attributes).forEach(([attr, value]) => {
                if (typeof value === "string") {
                    const fval = value.slice(1, -1);

                    if (attr === "class") {
                        OutputElement.classList.add(...fval.split(" "))
                    } else if (![
                        "id", "style",
                        "data-live-preview-output-container-debug",
                        "data-live-preview-output-container-resize",
                    ].includes(attr)) {
                        OutputElement.setAttribute(attr, fval)
                    }
                }
            })
        } else {
            RootMain.removeAttribute("style", "");
            OutputElement.getAttributeNames.forEach(attr => {
                if (![
                    "id", "class", "style",
                    "data-live-preview-output-container-debug",
                    "data-live-preview-output-container-resize",
                ].includes(attr)) {
                    OutputElement.removeAttribute(attr)
                }
            })
        }
    }
}

// --- Drag handle Logic ---

let dragActive = false;
const dragStart = { x: 0, y: 0 };
const dragPosition = { top: 0, left: 0 };
const widgetElement = document.getElementById('live-preview-widget');
const dragElement = document.getElementById('live-preview-option-drag-handle');

if (dragElement && widgetElement) {
    dragElement.addEventListener('mousedown', (e) => {
        dragActive = true;
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        const computedStyle = window.getComputedStyle(widgetElement);
        dragPosition.left = parseFloat(computedStyle.left || '0');
        dragPosition.top = parseFloat(computedStyle.top || '0');
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (dragActive) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            dragPosition.top = dragPosition.top + dy;
            dragPosition.left = dragPosition.left + dx;
            widgetElement.style.top = dragPosition.top + 'px';
            widgetElement.style.left = dragPosition.left + 'px';
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;
        }
    });

    document.addEventListener('mouseup', () => {
        if (dragActive) {
            dragActive = false;
            document.body.style.userSelect = '';
        }
    });
}

// --- WebSocket Setup ---
const ws = new WebSocket(`ws://${location.hostname}:${location.port}/ws`);
ws.onopen = function () {
    console.log('WebSocket connected');
};
ws.onerror = function (e) {
    console.error('WebSocket error:', e);
};
ws.onmessage = function (evt) {
    const msg = JSON.parse(evt.data);
    // Assume JSON-RPC format: { jsonrpc: "2.0", method: "updateState"/"updateOutput", result: ..., id: ... }
    // You may need to map from msg.method/msg.result/msg.params
    if (msg.method === 'updateState') {
        tweakIndex[msg.params.key]?.apply(msg.params.value);
    } else if (msg.method === 'updateOutput') {
        try {
            const newData = msg.result;
            if (newData && typeof newData === "object") {
                Object.assign(OutputData, newData);
                OutputUpdate(true);
            } else {
                OutputUpdate(false);
            }
        } catch (e) {
            console.error("Unable to update component!");
        }
    }
};

// --- Tweak class modification ---
class Tweak {
    constructor(key, applyFunction = () => { }, options = {}) {
        this.key = key;
        this.apply = applyFunction.bind(this);
        this._element = null;
        this.options = options;
        this.import();
    }

    get element() {
        if (!this._element) {
            this._element = document.getElementById(this.key);
            if (this._element) {
                this._element.addEventListener('input', () => { this.export(); });
                this._element.addEventListener('change', () => { this.export(); });
            }
        }
        return this._element;
    }

    export() {
        if (ws.readyState === WebSocket.OPEN && this.element) {
            ws.send(JSON.stringify({
                jsonrpc: "2.0",
                method: 'setState',
                id: Math.floor(Math.random() * 100000),
                params: {
                    key: this.key,
                    value: this.element.type === 'checkbox' ? this.element.checked : this.element.value
                }
            }));
            this.apply();
        }
    }

    import() {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                jsonrpc: "2.0",
                method: 'getState',
                id: Math.floor(Math.random() * 100000),
                params: { key: this.key }
            }));
        }
    }
}

const tweaks = [
    new Tweak('live-preview-option-live-cursor', function (value = this.element?.checked) {
        if (this.element && value !== undefined) {
            const valBool = typeof value === "boolean" ? value : (value === 'true');
            this.element.checked = valBool;
            if (valBool) this.element.setAttribute("checked", "")
            else this.element.removeAttribute("checked")
            OutputUpdate();
        }
    }),
    new Tweak('live-preview-option-color-picker', function (value = this.element?.value) {
        if (this.element && value !== undefined) {
            this.element.value = value;
            document.getElementById("live-preview-body").style.setProperty("--live-preview-extension-background", value);
        }
    }),

    new Tweak('live-preview-option-append-theme', function (value = this.element?.checked) {
        if (this.element && value !== undefined) {
            const valBool = typeof value === "boolean" ? value : (value === 'true');
            this.element.checked = valBool;
            outputState.useProjectCss = valBool;
            if (valBool) this.element.setAttribute("checked", "")
            else this.element.removeAttribute("checked")
            OutputUpdate();
        }
    }),
    new Tweak('live-preview-option-container-resize', function (value = this.element?.checked) {
        if (this.element && value !== undefined) {
            const valBool = typeof value === "boolean" ? value : (value === 'true');
            this.element.checked = valBool;
            outputState.activateResize = valBool;
            if (valBool) this.element.setAttribute("checked", "")
            else this.element.removeAttribute("checked")
            OutputUpdate();
        }
    }),
    new Tweak('live-preview-option-preserve-scale', function (value = this.element?.checked) {
        if (this.element && value !== undefined) {
            const valBool = typeof value === "boolean" ? value : (value === 'true');
            this.element.checked = valBool;
            outputState.preserveScale = valBool;
            if (valBool) this.element.setAttribute("checked", "")
            else this.element.removeAttribute("checked")
            OutputUpdate();
        }
    }),
    new Tweak('live-preview-option-debug-mode', function (value = this.element?.checked) {
        if (this.element && value !== undefined) {
            const valBool = typeof value === "boolean" ? value : (value === 'true');
            this.element.checked = valBool;
            outputState.activateDebug = valBool;
            if (valBool) this.element.setAttribute("checked", "")
            else this.element.removeAttribute("checked")
            OutputUpdate();
        }
    }),
];

const tweakIndex = tweaks.reduce((accumulator, tweak) => {
    accumulator[tweak.key] = tweak;
    return accumulator;
}, {});
