const data = (packageJson) => {
    return {
        name: packageJson.name,
        version: packageJson.version,
        website: packageJson.homepage,
        command: Object.keys(packageJson.bin),
        console: "https://console.xpktr.com/",
        content: "https://xcdn.xpktr.com/xcss/version/" + packageJson.version.split(".")[0],
        commandList: {
            init: 'Initiate or Update & Verify setup.',
            dev: 'Live build for dev environment',
            preview: 'Fast build, preserves class names.',
            build: 'Build minified.'
        },
    };
};

export default data;