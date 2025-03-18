import http from 'http';
import https from 'https';
import fs from 'fs'; // Added for completeness

const fileUtils = {
    hostHtmlFile: (filePath, port) => {
        // Pre-read file once to avoid repeated reads
        let cachedData;
        try {
            cachedData = fs.readFileSync(filePath);
        } catch (err) {
            console.error(`Failed to pre-load file: ${err.message}`);
            cachedData = null; // Handle gracefully in server
        }

        const startServer = (currentPort) => {
            const server = http.createServer((req, res) => {
                if (cachedData === null) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error loading HTML file');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(cachedData);
                }
            });

            server.listen(currentPort, () => {
                console.log(`Server running at http://localhost:${currentPort}/`);
            }).on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.warn(`Port ${currentPort} in use, trying ${currentPort + 1}`);
                    startServer(currentPort + 1);
                } else {
                    console.error('Server error:', err.message);
                }
            });

            // Graceful shutdown on process termination
            process.on('SIGINT', () => {
                server.close(() => {
                    console.log('Server shut down');
                    process.exit(0);
                });
            });
        };

        startServer(port);
    },

    downloadFile: (url, destinationPath) => {
        return new Promise((resolve, reject) => {
            const fileStream = fs.createWriteStream(destinationPath, { flags: 'wx' }); // Exclusive write to prevent overwrites

            const request = https.get(url, { timeout: 10000 }, (response) => {
                if (response.statusCode !== 200) {
                    fileStream.close();
                    fs.unlink(destinationPath, () => { }); // Clean up silently
                    return reject(new Error(`HTTP error ${response.statusCode}: ${response.statusMessage}`));
                }

                response.pipe(fileStream);

                fileStream.on('finish', () => {
                    fileStream.close(() => resolve(`File downloaded and saved to ${destinationPath}`));
                });
            });

            request.on('error', (error) => {
                fileStream.close();
                fs.unlink(destinationPath, () => { }); // Clean up silently
                reject(new Error(`Download error: ${error.message}`));
            });

            request.on('timeout', () => {
                request.destroy();
                fileStream.close();
                fs.unlink(destinationPath, () => { }); // Clean up silently
                reject(new Error('Request timed out'));
            });

            fileStream.on('error', (error) => {
                fs.unlink(destinationPath, () => { }); // Clean up silently
                reject(new Error(`Write error: ${error.message}`));
            });
        });
    },
};

// Export as default
export default fileUtils;