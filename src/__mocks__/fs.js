const path = require('path');

const fs = jest.genMockFromModule('fs');

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = Object.create(null);
function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(newMockFiles);
}

function readFile(path, encoding, cb) {
  if (mockFiles[path]) {
    cb(null, mockFiles[path]);
  } else {
    cb(new Error());
  }
}

fs.__setMockFiles = __setMockFiles;
fs.readFile = readFile;

module.exports = fs;
