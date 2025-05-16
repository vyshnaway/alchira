const data = (rootPath, contentUrl) => {
    return {
        DOCS: {
            readme: {
                title: "README",
                url: contentUrl + "/readme.md",
                path: rootPath + "/readme.md"
            },
            alerts: {
                title: "ALERTS",
                url: contentUrl + "/alerts.md",
                path: rootPath + "/alerts.md"
            },
        },
        AGREEMENT: {
            license: {
                title: "LICENSE",
                url: contentUrl + "/agreements-txt/license.txt",
                path: rootPath + '/AGREEMENTS/license.txt'
            },
            terms: {
                title: "TERMS & CONDITIONS",
                url: contentUrl + "/agreements-txt/terms.txt",
                path: rootPath + '/AGREEMENTS/terms.txt'
            },
            privacy: {
                title: "PRIVACY POLICY",
                url: contentUrl + "/agreements-txt/privacy.txt",
                path: rootPath + '/AGREEMENTS/privacy.txt'
            },
        },
        PREFIX: {
            atrules: {
                url: contentUrl + "/prefixes/atrules.json",
                path: rootPath + "/scaffold/prefix/atrules.json"
            },
            classes: {
                url: contentUrl + "/prefixes/classes.json",
                path: rootPath + "/scaffold/prefix/classes.json"
            },
            elements: {
                url: contentUrl + "/prefixes/elements.json",
                path: rootPath + "/scaffold/prefix/elements.json"
            },
            properties: {
                url: contentUrl + "/prefixes/properties.json",
                path: rootPath + "/scaffold/prefix/properties.json"
            },
        },
    };
};

export default data;