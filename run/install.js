#!/usr/bin/env node

import { detectCompatibleBinary } from "./detect.js";
// import https from 'https';
// import fs from 'fs';
// import path from 'path';

// // Parameters: replace as needed
// const assetUrl = 'https://github.com/{owner}/{repo}/releases/download/{tag}/{filename}';
// const targetPath = path.resolve(__dirname, 'downloads', 'your-local-filename.zip');

// // Download and save
// https.get(assetUrl, (res) => {
//     if (res.statusCode === 302 && res.headers.location) {
//         // Handle GitHub's redirect to actual file location
//         https.get(res.headers.location, (fileRes) => {
//             fileRes.pipe(fs.createWriteStream(targetPath));
//             fileRes.on('end', () => console.log('Download complete.'));
//         });
//     } else {
//         res.pipe(fs.createWriteStream(targetPath));
//         res.on('end', () => console.log('Download complete.'));
//     }
// }).on('error', (e) => {
//     console.error(`Download error: ${e.message}`);
// });

detectCompatibleBinary()