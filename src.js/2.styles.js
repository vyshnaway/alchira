import W from './Workers/package.js'

export const xtylesheetBuilder = () => {

}

function buildPreface() {
    let content = '';
    switch (command) {
        case 'dev': content = W.code.clean.css(content); break;
        case 'preview': content = W.code.minify.lite(content); break;
        case 'build': content = W.code.minify.strict(content); break;
    }
 
    return W.code.minify.lite(content);
}

function publishStylesheets() {
    let content = buildPreface();
}
