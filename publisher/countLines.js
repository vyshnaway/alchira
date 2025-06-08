import fs from "fs";
import path from "path";

/**
 * Recursively reads files from a directory, excluding files that match the excludePatterns.
 *
 * @param {string} directory - The path to the directory to read.
 * @param {RegExp[]} excludePatterns - An array of regular expression patterns to exclude files.
 * @returns {string[]} An array of file paths.
 */
function readFilesRecursively(directory, excludePatterns) {
    let fileList = [];

    /**
     * Recursively walks through the directory and its subdirectories, adding file paths to the fileList.
     *
     * @param {string} currentPath - The current path being processed.
     */
    function walkSync(currentPath) {
        const files = fs.readdirSync(currentPath);

        for (const file of files) {
            const filePath = path.join(currentPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                walkSync(filePath); // Recurse into subdirectories
            } else if (stats.isFile()) {
                const shouldExclude = excludePatterns.some(pattern => pattern.test(filePath));
                if (!shouldExclude) {
                    fileList.push(filePath);
                }
            }
        }
    }

    walkSync(directory);
    return fileList;
}

/**
 * Counts the number of lines in a file.
 *
 * @param {string} filePath - The path to the file.
 * @returns {number} The number of lines in the file, or 0 if there's an error.
 */
function countLines(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        // Split the content by newline characters and count the resulting array's length
        const lines = fileContent.split(/\r\n|\n|\r/).length;
        return lines;
    } catch (error) {
        console.error(`Error reading or counting lines in file: ${filePath}`, error);
        return 0; // Return 0 in case of error to avoid crashing.
    }
}

/**
 * Collects all .js files (excluding test files) in the specified directory and counts the lines of code.
 *
 * @param {string} directoryPath - The path to the directory to analyze.
 * @returns {object} An object containing the total number of files, the total number of lines,
 * and an array of file paths with their corresponding line counts.  Returns null on error.
 */
function collectAndCountLines(directoryPath) {
    try {
        // Define an array of regular expressions to match test file patterns.
        const excludePatterns = [
            /.*\.test\.js$/,       // Matches files ending with ".test.js"
            /.*_test\.js$/,       // Matches files ending with "_test.js"
            /.*Test\.js$/,       // Matches files ending with "Test.js"
            /.*_Test\.js$/,       // Matches files ending with "_Test.js"
            /test\/.*\.js$/,     // Matches files in a "test" directory at any level
            /tests\/.*\.js$/,    // Matches files in a "tests" directory at any level
            /__tests__\/.*\.js$/ // Matches files in a "__tests__" directory
        ];

        const jsFiles = readFilesRecursively(directoryPath, excludePatterns);
        const fileLineCounts = [];
        let totalLines = 0;
        let totalFiles = 0; // Keep track of the number of files

        for (const file of jsFiles) {
            if (path.extname(file) === '.js') { // Double check the extension
                const lineCount = countLines(file);
                fileLineCounts.push({ file, lines: lineCount });
                totalLines += lineCount;
                totalFiles++; // Increment file count
            }
        }

        return {
            totalFiles: totalFiles, // Return the total number of files
            totalLines: totalLines,
            files: fileLineCounts,
        };
    } catch (error) {
        console.error(`Error collecting and counting lines: ${error}`);
        return null; // Return null to indicate an error
    }
}

// Example usage:
const directoryToAnalyze = '../javascript'; // Replace with the path to your directory
const result = collectAndCountLines(directoryToAnalyze);

if (result) {
    console.log(`Total number of files: ${result.totalFiles}`);
    console.log(`Total lines of code: ${result.totalLines}`);
    console.log('File-wise line counts:');
    result.files.forEach(fileInfo => {
        console.log(`${fileInfo.file}: ${fileInfo.lines} lines`);
    });
} else {
    console.log('An error occurred during the process.');
}
