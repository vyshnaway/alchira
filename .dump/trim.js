const extn = 'js';
const args = process.argv;
const fs = require('fs');
const pt = require('path');

const createArgs = [
    '-c',
    '-g',
    '-generate',
    '-create',
    '--c',
    '--create',
    '--generate',
]

const delArgs = [
    '-d',
    '-del',
    '-delete',
    '--d',
    '--del',
    '--delete'
]

function trimFilesByRegex(path, regex) {
    let files, jsFiles;
    try {
        if (/\/$/.test(path)) {
            files = fs.readdirSync(path);
            jsFiles = files.filter(file =>
                (pt.extname(file) === '.js') && !(/.min.js$/.test(file)));
            jsFiles.sort((a, b) => b.localeCompare(a));
            jsFiles = jsFiles.map(file => path + file)
        } else {
            jsFiles = [(path.extname === '.js') ? path : (path + '.js')]
        }
        if (jsFiles.length) {
            const mergedContent = jsFiles.map(file => {
                const content = '\n' + fs.readFileSync(file, 'utf8')
                    .replace(/}[\s\n]*const/g, '};\nconst')
                    .replace(/\n+\s*/g, '\n')
                    .replace(/(\n)\/\/(.*)\n/, "\n")
                    .replace(/(^['"])\/\/.*$/gm)
                    .replace(/(\n|^)import\s+[^'"]*['"][^'"]*['"];\n?/g, '')
                    .replace(/\bexport\s+const\b/g, 'const')
                    .replace(/[\r\n]+/g, ' ')
                    .replace(/(\/\*[\s\S]*?\*\/)|(\/\/.*$)/gm, '')
                    .replace(/\nconst\s+(run|build|dev|start|load|create)\s+=/g, (match, p1) => `\nexport const ${p1} =`)
                    .replace(/[\n|\s](return|const|let|var)/, match => ';' + match)

                const newFilePath = file.replace(/\.js$/, '.min.js');
                fs.writeFileSync(newFilePath, content);
                console.log('>>> Generated ' + ((/\/$/.test(path)) ? path : '') + newFilePath)
                return content;
            }).join('')
            if (/\/$/.test(path)) {
                const newFilePath = path.replace(/\/$/, '.min.js');
                fs.writeFileSync(newFilePath, mergedContent, 'utf8');
                console.log('\n>>> Cumulated min.js generated at ' + newFilePath)
            }
            console.log('\n' + 'Files minified: ' + ((jsFiles.length !== 1) + jsFiles.length) + '\n')
        }
        else {
            console.log('\n>>> 0 .js files found!!!\n')
        }
    } catch (err) {
        console.log("\n>>> Path doesn't exist!!!\n");
    }
}

function deleteFilesByRegex(path, regex) {
    if (/\/$/.test(path)) {
        const files = fs.readdirSync(path);
        const filesToDelete = files.filter(file => regex.test(file)).map(file => pt.join(path, file));
        filesToDelete.forEach(filePath => {
            fs.unlinkSync(filePath);
            console.log(">>> Deleted " + filePath);
        });
        console.log('\n' + filesToDelete.length + ' files Deleted.\n')
    } else {
        path += /.min.js$/.test(path) ? '' : '.min.js'
        fs.unlinkSync(pt.join(path));
        console.log(">>> Deleted " + path + '\n');
    }

}

if (args.some(arg => createArgs.includes(arg))) {
    const target = args[args.indexOf(args.find(arg => createArgs.includes(arg))) + 1];
    console.log('\nGenerating min.js files at: ' + target + '\n');
    const regex = new RegExp(`\\.${extn}$`)
    trimFilesByRegex(target, regex);
}

if (args.some(arg => delArgs.includes(arg))) {
    const target = args[args.indexOf(args.find(arg => delArgs.includes(arg))) + 1];
    console.log('\nDeleting min.js files at: ' + target + '\n')
    const regex = new RegExp(`\\.min\\.${extn}$`)
    deleteFilesByRegex(target, regex);
}