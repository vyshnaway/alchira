export const convertComponentListToObjectArray = (htmlString, source = '') => {
    const componentRegex = /<component id="(.*?)">(.*?)<\/component>/gs;
    const results = [];
    const components = [];
    let match;
    while ((match = componentRegex.exec(htmlString)) !== null) {
        const componentName = source + '_' + match[1];
        components.push('#' + componentName)
        results.push({
            id: componentName,
            content: match[2].trim()
        });
    }

    return { results, components };
}

export const buildMainContent = (components) => {
    return components.reduce((acc, component) => {
        const sectionContent = `
            <section id='${component.id}'>
                <div class="classx-section-head">
                    <h2>${component.id}</h2>
                    <button type="button" onclick="navigator.clipboard.writeText('${component.content}')">Copy Script</button>
                </div>
                <div class="classx-component">
                    ${component.content}
                </div>
            </section>
        `
        return acc + sectionContent
    }, '')
}

export const buildSidebarContent = (sources) => {
    return sources.reduce((acc, source) => acc + `
        <li><button id="${source}" onclick="filterBySource('${source}')">${source}</button></li>`, `
        <li><button id="all" class="active" onclick="filterBySource('all')">All</button></li>`)
}

export const buildScriptContent = (allSourceComponents) => {
    return `
        const allSourceComponents = JSON.parse('${JSON.stringify(allSourceComponents)}');
    `
}


const updateXurfBrowser = (config) => {
    const styles = stylesheetPreprocessor();
    let sources = [];
    let componentList = [];
    let allComponentsObj = [];

    tag('>>> Fetching required references')
    let allSourceComponents = getFilesInDirectory(config.path + '/component-list').reduce((acc, file) => {
        const source = file.split('/').pop().replace(/\.[^/.]+$/, '').replace(' ', '_')
        const script = readFromFile(file);
        const { results, components } = convertComponentListToObjectArray(script, source);
        results.forEach(result => scriptEngine(result.content, "list", file, config.shorthands))
        sources.push(source);
        componentList = [...componentList, ...components]
        allComponentsObj = [...allComponentsObj, ...results];
        acc[source] = components;
        return acc;
    }, {})
    allSourceComponents["all"] = componentList;

    tag('>>> Generating Component Browser site')
    let browserHtml = readFromFile(config.root + '/.comp-browser.html')
    browserHtml = browserHtml.replace(config.compBrowser.mainMarker, buildMainContent(allComponentsObj));
    browserHtml = browserHtml.replace(config.compBrowser.sidebarMarker, buildSidebarContent(sources));
    browserHtml = browserHtml.replace(config.compBrowser.scriptMarker, buildScriptContent(allSourceComponents));
    writeToFile(config.path + '/comp-browser.html', browserHtml)
}
