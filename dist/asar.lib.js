module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("mkdirp");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = __webpack_require__(0);
var path = __webpack_require__(1);
var tmp = __webpack_require__(6);
var UINT64 = __webpack_require__(7).UINT64;

var Filesystem = function () {
  function Filesystem(src) {
    _classCallCheck(this, Filesystem);

    this.src = path.resolve(src);
    this.header = { files: {} };
    this.offset = UINT64(0);
  }

  _createClass(Filesystem, [{
    key: 'searchNodeFromDirectory',
    value: function searchNodeFromDirectory(p) {
      var json = this.header;
      var dirs = p.split(path.sep);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = dirs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var dir = _step.value;

          if (dir !== '.') {
            json = json.files[dir];
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return json;
    }
  }, {
    key: 'searchNodeFromPath',
    value: function searchNodeFromPath(p) {
      p = path.relative(this.src, p);
      if (!p) {
        return this.header;
      }
      var name = path.basename(p);
      var node = this.searchNodeFromDirectory(path.dirname(p));
      if (node.files == null) {
        node.files = {};
      }
      if (node.files[name] == null) {
        node.files[name] = {};
      }
      return node.files[name];
    }
  }, {
    key: 'insertDirectory',
    value: function insertDirectory(p, shouldUnpack) {
      var node = this.searchNodeFromPath(p);
      if (shouldUnpack) {
        node.unpacked = shouldUnpack;
      }
      node.files = {};
      return node.files;
    }
  }, {
    key: 'insertFile',
    value: function insertFile(p, shouldUnpack, file, options, callback) {
      var _this = this;

      var dirNode = this.searchNodeFromPath(path.dirname(p));
      var node = this.searchNodeFromPath(p);
      if (shouldUnpack || dirNode.unpacked) {
        node.size = file.stat.size;
        node.unpacked = true;
        process.nextTick(callback);
        return;
      }

      var handler = function handler() {
        var size = file.transformed ? file.transformed.stat.size : file.stat.size;

        // JavaScript can not precisely present integers >= UINT32_MAX.
        if (size > 4294967295) {
          throw new Error(p + ': file size can not be larger than 4.2GB');
        }

        node.size = size;
        node.offset = _this.offset.toString();
        if (process.platform !== 'win32' && file.stat.mode & 64) {
          node.executable = true;
        }
        _this.offset.add(UINT64(size));

        return callback();
      };

      var tr = options.transform && options.transform(p);
      if (tr) {
        return tmp.file(function (err, path) {
          if (err) {
            return handler();
          }
          var out = fs.createWriteStream(path);
          var stream = fs.createReadStream(p);

          stream.pipe(tr).pipe(out);
          return tr.on('end', function () {
            file.transformed = {
              path: path,
              stat: fs.lstatSync(path)
            };
            return handler();
          });
        });
      } else {
        return process.nextTick(handler);
      }
    }
  }, {
    key: 'insertLink',
    value: function insertLink(p, stat) {
      var link = path.relative(fs.realpathSync(this.src), fs.realpathSync(p));
      if (link.substr(0, 2) === '..') {
        throw new Error(p + ': file links out of the package');
      }
      var node = this.searchNodeFromPath(p);
      node.link = link;
      return link;
    }
  }, {
    key: 'listFiles',
    value: function listFiles() {
      var files = [];
      var fillFilesFromHeader = function fillFilesFromHeader(p, json) {
        if (!json.files) {
          return;
        }
        return function () {
          var result = [];
          for (var f in json.files) {
            var fullPath = path.join(p, f);
            files.push(fullPath);
            result.push(fillFilesFromHeader(fullPath, json.files[f]));
          }
          return result;
        }();
      };

      fillFilesFromHeader('/', this.header);
      return files;
    }
  }, {
    key: 'getNode',
    value: function getNode(p) {
      var node = this.searchNodeFromDirectory(path.dirname(p));
      var name = path.basename(p);
      if (name) {
        return node.files[name];
      } else {
        return node;
      }
    }
  }, {
    key: 'getFile',
    value: function getFile(p, followLinks) {
      followLinks = typeof followLinks === 'undefined' ? true : followLinks;
      var info = this.getNode(p);

      // if followLinks is false we don't resolve symlinks
      if (info.link && followLinks) {
        return this.getFile(info.link);
      } else {
        return info;
      }
    }
  }]);

  return Filesystem;
}();

module.exports = Filesystem;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var fs = __webpack_require__(0);
var path = __webpack_require__(1);
var minimatch = __webpack_require__(5);
var mkdirp = __webpack_require__(2);

var Filesystem = __webpack_require__(3);
var disk = __webpack_require__(8);
var crawlFilesystem = __webpack_require__(10);
var createSnapshot = __webpack_require__(12);

// Return whether or not a directory should be excluded from packing due to
// "--unpack-dir" option
//
// @param {string} path - diretory path to check
// @param {string} pattern - literal prefix [for backward compatibility] or glob pattern
// @param {array} unpackDirs - Array of directory paths previously marked as unpacked
//
var isUnpackDir = function isUnpackDir(path, pattern, unpackDirs) {
  if (path.indexOf(pattern) === 0 || minimatch(path, pattern)) {
    if (unpackDirs.indexOf(path) === -1) {
      unpackDirs.push(path);
    }
    return true;
  } else {
    for (var i = 0; i < unpackDirs.length; i++) {
      if (path.indexOf(unpackDirs[i]) === 0) {
        return true;
      }
    }
    return false;
  }
};

module.exports.createPackage = function (src, dest, callback) {
  return module.exports.createPackageWithOptions(src, dest, {}, callback);
};

module.exports.createPackageWithOptions = function (src, dest, options, callback) {
  var dot = typeof options.dot === 'undefined' ? true : options.dot;

  return crawlFilesystem(src, { dot: dot }, function (error, filenames, metadata) {
    if (error) {
      return callback(error);
    }
    module.exports.createPackageFromFiles(src, dest, filenames, metadata, options, callback);
  });
};

/*
createPackageFromFiles - Create an asar-archive from a list of filenames
src: Base path. All files are relative to this.
dest: Archive filename (& path).
filenames: Array of filenames relative to src.
metadata: Object with filenames as keys and {type='directory|file|link', stat: fs.stat} as values. (Optional)
options: The options.
callback: The callback function. Accepts (err).
*/
module.exports.createPackageFromFiles = function (src, dest, filenames, metadata, options, callback) {
  if (typeof metadata === 'undefined' || metadata === null) {
    metadata = {};
  }
  var filesystem = new Filesystem(src);
  var files = [];
  var unpackDirs = [];

  var filenamesSorted = [];
  if (options.ordering) {
    var orderingFiles = fs.readFileSync(options.ordering).toString().split('\n').map(function (line) {
      if (line.includes(':')) {
        line = line.split(':').pop();
      }
      line = line.trim();
      if (line.startsWith('/')) {
        line = line.slice(1);
      }
      return line;
    });

    var ordering = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = orderingFiles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var file = _step.value;

        var pathComponents = file.split(path.sep);
        var str = src;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = pathComponents[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var pathComponent = _step4.value;

            str = path.join(str, pathComponent);
            ordering.push(str);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var missing = 0;
    var total = filenames.length;

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = ordering[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _file = _step2.value;

        if (!filenamesSorted.includes(_file) && filenames.includes(_file)) {
          filenamesSorted.push(_file);
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = filenames[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var _file2 = _step3.value;

        if (!filenamesSorted.includes(_file2)) {
          filenamesSorted.push(_file2);
          missing += 1;
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    console.log('Ordering file has ' + (total - missing) / total * 100 + '% coverage.');
  } else {
    filenamesSorted = filenames;
  }

  var handleFile = function handleFile(filename, done) {
    var file = metadata[filename];
    var type = void 0;
    if (!file) {
      var stat = fs.lstatSync(filename);
      if (stat.isDirectory()) {
        type = 'directory';
      }
      if (stat.isFile()) {
        type = 'file';
      }
      if (stat.isSymbolicLink()) {
        type = 'link';
      }
      file = { stat: stat, type: type };
    }

    var shouldUnpack = void 0;
    switch (file.type) {
      case 'directory':
        shouldUnpack = options.unpackDir ? isUnpackDir(path.relative(src, filename), options.unpackDir, unpackDirs) : false;
        filesystem.insertDirectory(filename, shouldUnpack);
        break;
      case 'file':
        shouldUnpack = false;
        if (options.unpack) {
          shouldUnpack = minimatch(filename, options.unpack, { matchBase: true });
        }
        if (!shouldUnpack && options.unpackDir) {
          var dirName = path.relative(src, path.dirname(filename));
          shouldUnpack = isUnpackDir(dirName, options.unpackDir, unpackDirs);
        }
        files.push({ filename: filename, unpack: shouldUnpack });
        filesystem.insertFile(filename, shouldUnpack, file, options, done);
        return;
      case 'link':
        filesystem.insertLink(filename, file.stat);
        break;
    }
    return process.nextTick(done);
  };

  var insertsDone = function insertsDone() {
    return mkdirp(path.dirname(dest), function (error) {
      if (error) {
        return callback(error);
      }
      return disk.writeFilesystem(dest, filesystem, files, metadata, function (error) {
        if (error) {
          return callback(error);
        }
        if (options.snapshot) {
          return createSnapshot(src, dest, filenames, metadata, options, callback);
        } else {
          return callback(null);
        }
      });
    });
  };

  var names = filenamesSorted.slice();

  var next = function next(name) {
    if (!name) {
      return insertsDone();
    }

    return handleFile(name, function () {
      return next(names.shift());
    });
  };

  return next(names.shift());
};

module.exports.statFile = function (archive, filename, followLinks) {
  var filesystem = disk.readFilesystemSync(archive);
  return filesystem.getFile(filename, followLinks);
};

module.exports.listPackage = function (archive) {
  return disk.readFilesystemSync(archive).listFiles();
};

module.exports.extractFile = function (archive, filename) {
  var filesystem = disk.readFilesystemSync(archive);
  return disk.readFileSync(filesystem, filename, filesystem.getFile(filename));
};

module.exports.extractAll = function (archive, dest) {
  var filesystem = disk.readFilesystemSync(archive);
  var filenames = filesystem.listFiles();

  // under windows just extract links as regular files
  var followLinks = process.platform === 'win32';

  // create destination directory
  mkdirp.sync(dest);

  return filenames.map(function (filename) {
    filename = filename.substr(1); // get rid of leading slash
    var destFilename = path.join(dest, filename);
    var file = filesystem.getFile(filename, followLinks);
    if (file.files) {
      // it's a directory, create it and continue with the next entry
      mkdirp.sync(destFilename);
    } else if (file.link) {
      // it's a symlink, create a symlink
      var linkSrcPath = path.dirname(path.join(dest, file.link));
      var linkDestPath = path.dirname(destFilename);
      var relativePath = path.relative(linkDestPath, linkSrcPath);
      // try to delete output file, because we can't overwrite a link
      (function () {
        try {
          fs.unlinkSync(destFilename);
        } catch (error) {}
      })();
      var linkTo = path.join(relativePath, path.basename(file.link));
      fs.symlinkSync(linkTo, destFilename);
    } else {
      // it's a file, extract it
      var content = disk.readFileSync(filesystem, filename, file);
      fs.writeFileSync(destFilename, content);
    }
  });
};

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("minimatch");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("tmp");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("cuint");

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var fs = __webpack_require__(0);
var path = __webpack_require__(1);
var mkdirp = __webpack_require__(2);
var pickle = __webpack_require__(9);
var Filesystem = __webpack_require__(3);
var filesystemCache = {};

var copyFileToSync = function copyFileToSync(dest, src, filename) {
  var srcFile = path.join(src, filename);
  var targetFile = path.join(dest, filename);

  var content = fs.readFileSync(srcFile);
  var stats = fs.statSync(srcFile);
  mkdirp.sync(path.dirname(targetFile));
  return fs.writeFileSync(targetFile, content, { mode: stats.mode });
};

var writeFileListToStream = function writeFileListToStream(dest, filesystem, out, list, metadata, callback) {
  if (list.length === 0) {
    out.end();
    return callback(null);
  }

  var file = list[0];
  if (file.unpack) {
    // the file should not be packed into archive.
    var filename = path.relative(filesystem.src, file.filename);
    try {
      copyFileToSync(dest + '.unpacked', filesystem.src, filename);
    } catch (error) {
      return callback(error);
    }
    return writeFileListToStream(dest, filesystem, out, list.slice(1), metadata, callback);
  } else {
    var tr = metadata[file.filename].transformed;
    var stream = fs.createReadStream(tr ? tr.path : file.filename);
    stream.pipe(out, { end: false });
    stream.on('error', callback);
    return stream.on('end', function () {
      return writeFileListToStream(dest, filesystem, out, list.slice(1), metadata, callback);
    });
  }
};

module.exports.writeFilesystem = function (dest, filesystem, files, metadata, callback) {
  var sizeBuf = void 0;
  var headerBuf = void 0;
  try {
    var headerPickle = pickle.createEmpty();
    headerPickle.writeString(JSON.stringify(filesystem.header));
    headerBuf = headerPickle.toBuffer();

    var sizePickle = pickle.createEmpty();
    sizePickle.writeUInt32(headerBuf.length);
    sizeBuf = sizePickle.toBuffer();
  } catch (error) {
    return callback(error);
  }

  var out = fs.createWriteStream(dest);
  out.on('error', callback);
  out.write(sizeBuf);
  return out.write(headerBuf, function () {
    return writeFileListToStream(dest, filesystem, out, files, metadata, callback);
  });
};

module.exports.readArchiveHeaderSync = function (archive) {
  var fd = fs.openSync(archive, 'r');
  var size = void 0;
  var headerBuf = void 0;
  try {
    var sizeBuf = new Buffer(8);
    var startPos = this.checkFileSignature(archive, null);

    if (fs.readSync(fd, sizeBuf, 0, 8, startPos) !== 8) {
      throw new Error('Unable to read header size');
    }

    var sizePickle = pickle.createFromBuffer(sizeBuf);
    size = sizePickle.createIterator().readUInt32();
    headerBuf = new Buffer(size);
    if (fs.readSync(fd, headerBuf, 0, size, startPos + 8) !== size) {
      throw new Error('Unable to read header');
    }
  } finally {
    fs.closeSync(fd);
  }
  var headerPickle = pickle.createFromBuffer(headerBuf);
  var header = headerPickle.createIterator().readString();
  return { header: JSON.parse(header), headerSize: size };
};

module.exports.readFilesystemSync = function (archive) {
  if (!filesystemCache[archive]) {
    var header = this.readArchiveHeaderSync(archive);
    var filesystem = new Filesystem(archive);
    filesystem.header = header.header;
    filesystem.headerSize = header.headerSize;
    filesystemCache[archive] = filesystem;
  }
  return filesystemCache[archive];
};

module.exports.readFileSync = function (filesystem, filename, info) {
  var buffer = new Buffer(info.size);
  if (info.size <= 0) {
    return buffer;
  }
  if (info.unpacked) {
    // it's an unpacked file, copy it.
    buffer = fs.readFileSync(path.join(filesystem.src + '.unpacked', filename));
  } else {
    // Node throws an exception when reading 0 bytes into a 0-size buffer,
    // so we short-circuit the read in this case.
    var fd = fs.openSync(filesystem.src, 'r');
    try {
      var offset = 8 + filesystem.headerSize + parseInt(info.offset);
      fs.readSync(fd, buffer, 0, info.size, offset);
    } finally {
      fs.closeSync(fd);
    }
  }
  return buffer;
};

module.exports.checkFileSignature = function (archive, defaultPosition) {
  var fd = fs.openSync(archive, 'r');
  var endCapSize = 12;
  var _b = Buffer.alloc(endCapSize);
  var size = fs.fstatSync(fd).size;
  if (size > endCapSize) {
    fs.readSync(fd, _b, 0, endCapSize, size - endCapSize);
    var _ref = [_b.readUIntLE(0, 6), _b.readUIntLE(6, 1), _b.readUIntLE(7, 5)],
        _size = _ref[0],
        _shift = _ref[1],
        _result = _ref[2];

    fs.closeSync(fd);
    var _start = size - _size - endCapSize;
    return _result === _size >> _shift ? _start : defaultPosition;
  }
};

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("chromium-pickle-js");

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var fs = __webpack_require__(0);
var glob = __webpack_require__(11);

module.exports = function (dir, options, callback) {
  var metadata = {};
  return glob(dir + '/**/*', options, function (error, filenames) {
    if (error) {
      return callback(error);
    }
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = filenames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var filename = _step.value;

        var stat = fs.lstatSync(filename);
        if (stat.isFile()) {
          metadata[filename] = { type: 'file', stat: stat };
        } else if (stat.isDirectory()) {
          metadata[filename] = { type: 'directory', stat: stat };
        } else if (stat.isSymbolicLink()) {
          metadata[filename] = { type: 'link', stat: stat };
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return callback(null, filenames, metadata);
  });
};

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("glob");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var fs = __webpack_require__(0);
var path = __webpack_require__(1);
var mksnapshot = __webpack_require__(13);
var vm = __webpack_require__(14);

var stripBOM = function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
};

var wrapModuleCode = function wrapModuleCode(script) {
  script = script.replace(/^#!.*/, '');
  return '(function(exports, require, module, __filename, __dirname) { ' + script + ' \n});';
};

var dumpObjectToJS = function dumpObjectToJS(content) {
  var result = 'var __ATOM_SHELL_SNAPSHOT = {\n';
  for (var filename in content) {
    var func = content[filename].toString();
    result += '  \'' + filename + '\': ' + func + ',\n';
  }
  result += '};\n';
  return result;
};

var createSnapshot = function createSnapshot(src, dest, filenames, metadata, options, callback) {
  var content = {};
  try {
    src = path.resolve(src);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = filenames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var filename = _step.value;

        var file = metadata[filename];
        if ((file.type === 'file' || file.type === 'link') && filename.substr(-3) === '.js') {
          var script = wrapModuleCode(stripBOM(fs.readFileSync(filename, 'utf8')));
          var relativeFilename = path.relative(src, filename);
          try {
            var compiled = vm.runInThisContext(script, { filename: relativeFilename });
            content[relativeFilename] = compiled;
          } catch (error) {
            console.error('Ignoring ' + relativeFilename + ' for ' + error.name);
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  } catch (error) {
    return callback(error);
  }

  // run mksnapshot
  var str = dumpObjectToJS(content);
  var version = options.version;
  var arch = options.arch;
  var builddir = options.builddir;
  var snapshotdir = options.snapshotdir;

  if (typeof snapshotdir === 'undefined' || snapshotdir === null) {
    snapshotdir = path.dirname(dest);
  }
  var target = path.resolve(snapshotdir, 'snapshot_blob.bin');
  return mksnapshot(str, target, version, arch, builddir, callback);
};

module.exports = createSnapshot;

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("mksnapshot");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("vm");

/***/ })
/******/ ]);