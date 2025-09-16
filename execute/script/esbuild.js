import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

const destination ='./execute/javascript/';

function clearFolder(folderPath) {
    if (!fs.existsSync(folderPath)) {
        console.error(`Folder does not exist: ${folderPath}`);
        return;
    }

    const entries = fs.readdirSync(folderPath);
    entries.forEach(entry => {
        const fullPath = path.join(folderPath, entry);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            clearFolder(fullPath);
            fs.rmdirSync(fullPath);
        } else {
            fs.unlinkSync(fullPath);
        }
    });
}

clearFolder(destination);

esbuild.build({
    entryPoints: ['typescript/main.ts'],
    bundle: true,
    minify: false,
    outfile: destination + 'main.js',
    target: ['node18'],
    platform: 'node',
    format: 'esm',
    legalComments: 'none'
})
    .then(() => {
        console.log('Js Bundling successful.');
    })
    .catch((err) => {
        console.error('Build error:', err);
        process.exit(1);
    });