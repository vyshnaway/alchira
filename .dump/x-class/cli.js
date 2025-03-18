import {
    load,
    start,
    run,
    build,
    buildMin
} from '../xclass/app.js';

export const xclass_cli = (args) => {
    if (args.some(c => ['v', '-v', '--v', 'version', '-version'].includes(c))) {
        console.log(rootConfig.version)
    }
    if (args.some(c => ['load'].includes(c))) {
        load();
    }
    if (args.some(c => ['start'].includes(c))) {
        start();
    }
    if (args.some(c => ['run', 'dev'].includes(c))) {
        run();
    }
    if (args.some(c => ['build'].includes(c))) {
        build();
    }
    if (args.some(c => ['build'].includes(c)) && args.some(c => ['m', '-m', '--m', 'minified', '-minified', '--minified', 'min', '-min', '--min'].includes(c))) {
        buildMin();
    }
    if (args.some(c => ['db', 'd-b', '-d-b', '--d-b', 'download-bundle', '-download-bundle', '--download-bundle', 'download', '-download', '--download'].includes(c))) {
        // downloadBundle(args(args.indexOf(c) + 1));
    }
    if (args.some(c => ['dt', 'd-t', '-d-t', '--d-t', 'download-theme', '-download-bundele', '--download-bundle'].includes(c))) {
        // downloadTheme(args(args.indexOf(c) + 1));
    }
    if (args.some(c => ['dcr', 'd-cr', '-d-cr', '--d-cr', 'download-class-refernce', '-download-class-refernce', '--download-class-refernce'].includes(c))) {
        // downloadClassReference(args(args.indexOf(c) + 1));
    }
    if (args.some(c => ['dcl', 'd-cl', '-d-cl', '--d-cl', 'download-component-list', '-download-component-list', '--download-component-list'].includes(c))) {
        // downloadComponentList(args(args.indexOf(c) + 1));
    }
}
