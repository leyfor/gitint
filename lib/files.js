
const fs = require('fs'),
    path = require('path');

module.exports = {
    getCurrentDirectoryBase: () => {
        return path.basename(process.cwd());
    },

    directoryExists: filePath => {
        try {
            // Check the statistics of the file
            return fs.statSync(filePath).isDirectory();
        } catch (error) {
            return false;
        }
    }
}
