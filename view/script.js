
// --- Initial Load ---

const RootBody = document.getElementById('live-preview-body');
const RootMain = document.getElementById('live-preview-main');
window.addEventListener('load', () => {
    setTimeout(() => {
        RootBody.parentElement.removeAttribute("style");
        console.log("Removed vscode css defaults.")
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
const RootCssElement = document.getElementById('live-preview-root-css');
const CompCssElement = document.getElementById('live-preview-comp-css');

const ComponentData = {
    staple: "",
    summon: "",
    symclass: "",
    attributes: "",
    watchclass: "",
    rootcss: "",
    compcss: "",
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

    RootCssElement.disabled = !outputState.useProjectCss;
    OutputElement.setAttribute("data-live-preview-output-container-debug", String(outputState.activateDebug))
    OutputElement.setAttribute("data-live-preview-output-container-resize", String(outputState.activateResize))
    OutputElement.setAttribute("data-live-preview-output-container-preserve", String(outputState.preserveScale))
    RootCssElement.innerText = ComponentData.rootcss
    CompCssElement.innerText = ComponentData.compcss

    if (updateComponent) {

        const snippet = (typeof ComponentData.staple === "string") ? ComponentData.staple : '';
        const structure = (typeof ComponentData.summon === "string" && ComponentData.summon.length) ? ComponentData.summon : "{Content}";
        const selector = (typeof ComponentData.symclass === "string" && ComponentData.symclass.length) ? ComponentData.symclass : '[N/A]';

        StapleElement.innerHTML = snippet;
        OutputElement.innerHTML = structure;
        OutputElement.className = "_";
        SymClassNameElement.innerText = selector;

        const attributes = JSON.parse(ComponentData.attributes);
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
    console.log(msg)
    if (msg.method === 'updateState') {
        tweakIndex[msg.result.key]?.apply(msg.result.value);
    } else if (msg.method === 'updateOutput') {
        try {
            const newData = msg.result;
            if (newData && typeof newData === "object") {
                Object.assign(ComponentData, newData);
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
    constructor(key, fallback, applyFunction = () => { }, options = {}) {
        this.key = key;
        this.fallback = fallback;
        this.apply = applyFunction.bind(this);
        this.dom_element = this.element;
        this.options = options;
    }

    get element() {
        if (!this.dom_element) {
            this.dom_element = document.getElementById(this.key);
            if (this.dom_element) {
                this.dom_element.addEventListener('change', () => { this.setState(); });
            }
        }
        return this.dom_element;
    }

    initState() {
        if (this.element) {
            ws.send(JSON.stringify({
                jsonrpc: "2.0",
                method: 'initState',
                id: Math.floor(Math.random() * 100000),
                params: {
                    key: this.key,
                    value: this.fallback,
                }
            }));
            this.apply();
        }
    }

    setState() {
        if (ws.readyState === WebSocket.OPEN && this.element) {
            ws.send(JSON.stringify({
                jsonrpc: "2.0",
                method: 'setState',
                id: Math.floor(Math.random() * 100000),
                params: {
                    key: this.key,
                    value: this.element.type === 'checkbox'
                        ? this.element.checked
                        : this.element.value
                }
            }));
            this.apply();
        }
    }
}

const tweaks = [
    new Tweak('live-preview-option-live-cursor', false, function (value = this.element?.checked) {
        if (this.element && value !== undefined) {
            const valBool = typeof value === "boolean" ? value : (value === 'true');
            this.element.checked = valBool;
            if (valBool) this.element.setAttribute("checked", "")
            else this.element.removeAttribute("checked")
            OutputUpdate();
        }
    }),
    new Tweak('live-preview-option-color-picker', '#ffffee', function (value = this.element?.value) {
        if (this.element && value !== undefined) {
            this.element.value = value;
            document.getElementById("live-preview-body").style.setProperty("--live-preview-extension-background", value);
        }
    }),

    new Tweak('live-preview-option-append-theme', false, function (value = this.element?.checked) {
        if (this.element && value !== undefined) {
            const valBool = typeof value === "boolean" ? value : (value === 'true');
            this.element.checked = valBool;
            outputState.useProjectCss = valBool;
            if (valBool) this.element.setAttribute("checked", "")
            else this.element.removeAttribute("checked")
            OutputUpdate();
        }
    }),
    new Tweak('live-preview-option-container-resize', false, function (value = this.element?.checked) {
        if (this.element && value !== undefined) {
            const valBool = typeof value === "boolean" ? value : (value === 'true');
            this.element.checked = valBool;
            outputState.activateResize = valBool;
            if (valBool) this.element.setAttribute("checked", "")
            else this.element.removeAttribute("checked")
            OutputUpdate();
        }
    }),
    new Tweak('live-preview-option-preserve-scale', false, function (value = this.element?.checked) {
        if (this.element && value !== undefined) {
            const valBool = typeof value === "boolean" ? value : (value === 'true');
            this.element.checked = valBool;
            outputState.preserveScale = valBool;
            if (valBool) this.element.setAttribute("checked", "")
            else this.element.removeAttribute("checked")
            OutputUpdate();
        }
    }),
    new Tweak('live-preview-option-debug-mode', false, function (value = this.element?.checked) {
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

const tweakIndex = {}
ws.onopen = () => {
    tweaks.forEach((tweak) => {
        tweakIndex[tweak.key] = tweak;
        tweak.initState();
    });
};