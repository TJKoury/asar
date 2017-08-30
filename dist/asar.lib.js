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

const fs = __webpack_require__(0)
const path = __webpack_require__(1)
const tmp = __webpack_require__(6)
const UINT64 = __webpack_require__(7).UINT64

class Filesystem {
  constructor (src) {
    this.src = path.resolve(src)
    this.header = {files: {}}
    this.offset = UINT64(0)
  }

  searchNodeFromDirectory (p) {
    let json = this.header
    const dirs = p.split(path.sep)
    for (const dir of dirs) {
      if (dir !== '.') {
        json = json.files[dir]
      }
    }
    return json
  }

  searchNodeFromPath (p) {
    p = path.relative(this.src, p)
    if (!p) { return this.header }
    const name = path.basename(p)
    const node = this.searchNodeFromDirectory(path.dirname(p))
    if (node.files == null) {
      node.files = {}
    }
    if (node.files[name] == null) {
      node.files[name] = {}
    }
    return node.files[name]
  }

  insertDirectory (p, shouldUnpack) {
    const node = this.searchNodeFromPath(p)
    if (shouldUnpack) {
      node.unpacked = shouldUnpack
    }
    node.files = {}
    return node.files
  }

  insertFile (p, shouldUnpack, file, options, callback) {
    const dirNode = this.searchNodeFromPath(path.dirname(p))
    const node = this.searchNodeFromPath(p)
    if (shouldUnpack || dirNode.unpacked) {
      node.size = file.stat.size
      node.unpacked = true
      process.nextTick(callback)
      return
    }

    const handler = () => {
      const size = file.transformed ? file.transformed.stat.size : file.stat.size

      // JavaScript can not precisely present integers >= UINT32_MAX.
      if (size > 4294967295) {
        throw new Error(`${p}: file size can not be larger than 4.2GB`)
      }

      node.size = size
      node.offset = this.offset.toString()
      if (process.platform !== 'win32' && (file.stat.mode & 0o100)) {
        node.executable = true
      }
      this.offset.add(UINT64(size))

      return callback()
    }

    const tr = options.transform && options.transform(p)
    if (tr) {
      return tmp.file(function (err, path) {
        if (err) { return handler() }
        const out = fs.createWriteStream(path)
        const stream = fs.createReadStream(p)

        stream.pipe(tr).pipe(out)
        return tr.on('end', function () {
          file.transformed = {
            path,
            stat: fs.lstatSync(path)
          }
          return handler()
        })
      })
    } else {
      return process.nextTick(handler)
    }
  }

  insertLink (p, stat) {
    const link = path.relative(fs.realpathSync(this.src), fs.realpathSync(p))
    if (link.substr(0, 2) === '..') {
      throw new Error(`${p}: file links out of the package`)
    }
    const node = this.searchNodeFromPath(p)
    node.link = link
    return link
  }

  listFiles () {
    const files = []
    const fillFilesFromHeader = function (p, json) {
      if (!json.files) {
        return
      }
      return (() => {
        const result = []
        for (const f in json.files) {
          const fullPath = path.join(p, f)
          files.push(fullPath)
          result.push(fillFilesFromHeader(fullPath, json.files[f]))
        }
        return result
      })()
    }

    fillFilesFromHeader('/', this.header)
    return files
  }

  getNode (p) {
    const node = this.searchNodeFromDirectory(path.dirname(p))
    const name = path.basename(p)
    if (name) {
      return node.files[name]
    } else {
      return node
    }
  }

  getFile (p, followLinks) {
    followLinks = typeof followLinks === 'undefined' ? true : followLinks
    const info = this.getNode(p)

    // if followLinks is false we don't resolve symlinks
    if (info.link && followLinks) {
      return this.getFile(info.link)
    } else {
      return info
    }
  }
}

module.exports = Filesystem


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const fs = __webpack_require__(0)
const path = __webpack_require__(1)
const minimatch = __webpack_require__(5)
const mkdirp = __webpack_require__(2)

const Filesystem = __webpack_require__(3)
const disk = __webpack_require__(8)
const crawlFilesystem = __webpack_require__(10)
const createSnapshot = __webpack_require__(12)

// Return whether or not a directory should be excluded from packing due to
// "--unpack-dir" option
//
// @param {string} path - diretory path to check
// @param {string} pattern - literal prefix [for backward compatibility] or glob pattern
// @param {array} unpackDirs - Array of directory paths previously marked as unpacked
//
const isUnpackDir = function (path, pattern, unpackDirs) {
  if (path.indexOf(pattern) === 0 || minimatch(path, pattern)) {
    if (unpackDirs.indexOf(path) === -1) {
      unpackDirs.push(path)
    }
    return true
  } else {
    for (let i = 0; i < unpackDirs.length; i++) {
      if (path.indexOf(unpackDirs[i]) === 0) {
        return true
      }
    }
    return false
  }
}

module.exports.createPackage = function (src, dest, callback) {
  return module.exports.createPackageWithOptions(src, dest, {}, callback)
}

module.exports.createPackageWithOptions = function (src, dest, options, callback) {
  const dot = typeof options.dot === 'undefined' ? true : options.dot

  return crawlFilesystem(src, { dot: dot }, function (error, filenames, metadata) {
    if (error) { return callback(error) }
    module.exports.createPackageFromFiles(src, dest, filenames, metadata, options, callback)
  })
}

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
  if (typeof metadata === 'undefined' || metadata === null) { metadata = {} }
  const filesystem = new Filesystem(src)
  const files = []
  const unpackDirs = []

  let filenamesSorted = []
  if (options.ordering) {
    const orderingFiles = fs.readFileSync(options.ordering).toString().split('\n').map(function (line) {
      if (line.includes(':')) { line = line.split(':').pop() }
      line = line.trim()
      if (line.startsWith('/')) { line = line.slice(1) }
      return line
    })

    const ordering = []
    for (const file of orderingFiles) {
      const pathComponents = file.split(path.sep)
      let str = src
      for (const pathComponent of pathComponents) {
        str = path.join(str, pathComponent)
        ordering.push(str)
      }
    }

    let missing = 0
    const total = filenames.length

    for (const file of ordering) {
      if (!filenamesSorted.includes(file) && filenames.includes(file)) {
        filenamesSorted.push(file)
      }
    }

    for (const file of filenames) {
      if (!filenamesSorted.includes(file)) {
        filenamesSorted.push(file)
        missing += 1
      }
    }

    console.log(`Ordering file has ${((total - missing) / total) * 100}% coverage.`)
  } else {
    filenamesSorted = filenames
  }

  const handleFile = function (filename, done) {
    let file = metadata[filename]
    let type
    if (!file) {
      const stat = fs.lstatSync(filename)
      if (stat.isDirectory()) { type = 'directory' }
      if (stat.isFile()) { type = 'file' }
      if (stat.isSymbolicLink()) { type = 'link' }
      file = {stat, type}
    }

    let shouldUnpack
    switch (file.type) {
      case 'directory':
        shouldUnpack = options.unpackDir
          ? isUnpackDir(path.relative(src, filename), options.unpackDir, unpackDirs)
          : false
        filesystem.insertDirectory(filename, shouldUnpack)
        break
      case 'file':
        shouldUnpack = false
        if (options.unpack) {
          shouldUnpack = minimatch(filename, options.unpack, {matchBase: true})
        }
        if (!shouldUnpack && options.unpackDir) {
          const dirName = path.relative(src, path.dirname(filename))
          shouldUnpack = isUnpackDir(dirName, options.unpackDir, unpackDirs)
        }
        files.push({filename: filename, unpack: shouldUnpack})
        filesystem.insertFile(filename, shouldUnpack, file, options, done)
        return
      case 'link':
        filesystem.insertLink(filename, file.stat)
        break
    }
    return process.nextTick(done)
  }

  const insertsDone = function () {
    return mkdirp(path.dirname(dest), function (error) {
      if (error) { return callback(error) }
      return disk.writeFilesystem(dest, filesystem, files, metadata, function (error) {
        if (error) { return callback(error) }
        if (options.snapshot) {
          return createSnapshot(src, dest, filenames, metadata, options, callback)
        } else {
          return callback(null)
        }
      })
    })
  }

  const names = filenamesSorted.slice()

  const next = function (name) {
    if (!name) { return insertsDone() }

    return handleFile(name, function () {
      return next(names.shift())
    })
  }

  return next(names.shift())
}

module.exports.statFile = function (archive, filename, followLinks) {
  const filesystem = disk.readFilesystemSync(archive)
  return filesystem.getFile(filename, followLinks)
}

module.exports.listPackage = function (archive) {
  return disk.readFilesystemSync(archive).listFiles()
}

module.exports.extractFile = function (archive, filename) {
  const filesystem = disk.readFilesystemSync(archive)
  return disk.readFileSync(filesystem, filename, filesystem.getFile(filename))
}

module.exports.extractAll = function (archive, dest) {
  const filesystem = disk.readFilesystemSync(archive)
  const filenames = filesystem.listFiles()

  // under windows just extract links as regular files
  const followLinks = process.platform === 'win32'

  // create destination directory
  mkdirp.sync(dest)

  return filenames.map((filename) => {
    filename = filename.substr(1)  // get rid of leading slash
    const destFilename = path.join(dest, filename)
    const file = filesystem.getFile(filename, followLinks)
    if (file.files) {
      // it's a directory, create it and continue with the next entry
      mkdirp.sync(destFilename)
    } else if (file.link) {
      // it's a symlink, create a symlink
      const linkSrcPath = path.dirname(path.join(dest, file.link))
      const linkDestPath = path.dirname(destFilename)
      const relativePath = path.relative(linkDestPath, linkSrcPath);
      // try to delete output file, because we can't overwrite a link
      (() => {
        try {
          fs.unlinkSync(destFilename)
        } catch (error) {}
      })()
      const linkTo = path.join(relativePath, path.basename(file.link))
      fs.symlinkSync(linkTo, destFilename)
    } else {
      // it's a file, extract it
      const content = disk.readFileSync(filesystem, filename, file)
      fs.writeFileSync(destFilename, content)
    }
  })
}


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

const fs = __webpack_require__(0)
const path = __webpack_require__(1)
const mkdirp = __webpack_require__(2)
const pickle = __webpack_require__(9)
const Filesystem = __webpack_require__(3)
const filesystemCache = {}

const copyFileToSync = function (dest, src, filename) {
  const srcFile = path.join(src, filename)
  const targetFile = path.join(dest, filename)

  const content = fs.readFileSync(srcFile)
  const stats = fs.statSync(srcFile)
  mkdirp.sync(path.dirname(targetFile))
  return fs.writeFileSync(targetFile, content, { mode: stats.mode })
}

const writeFileListToStream = function (dest, filesystem, out, list, metadata, callback) {
  if (list.length === 0) {
    out.end()
    return callback(null)
  }

  const file = list[0]
  if (file.unpack) {
    // the file should not be packed into archive.
    const filename = path.relative(filesystem.src, file.filename)
    try {
      copyFileToSync(`${dest}.unpacked`, filesystem.src, filename)
    } catch (error) {
      return callback(error)
    }
    return writeFileListToStream(dest, filesystem, out, list.slice(1), metadata, callback)
  } else {
    const tr = metadata[file.filename].transformed
    const stream = fs.createReadStream((tr ? tr.path : file.filename))
    stream.pipe(out, { end: false })
    stream.on('error', callback)
    return stream.on('end', function () {
      return writeFileListToStream(dest, filesystem, out, list.slice(1), metadata, callback)
    })
  }
}

module.exports.writeFilesystem = function (dest, filesystem, files, metadata, callback) {
  let sizeBuf
  let headerBuf
  try {
    const headerPickle = pickle.createEmpty()
    headerPickle.writeString(JSON.stringify(filesystem.header))
    headerBuf = headerPickle.toBuffer()

    const sizePickle = pickle.createEmpty()
    sizePickle.writeUInt32(headerBuf.length)
    sizeBuf = sizePickle.toBuffer()
  } catch (error) {
    return callback(error)
  }

  const out = fs.createWriteStream(dest)
  out.on('error', callback)
  out.write(sizeBuf)
  return out.write(headerBuf, function () {
    return writeFileListToStream(dest, filesystem, out, files, metadata, callback)
  })
}

module.exports.readArchiveHeaderSync = function (archive) {
  const fd = fs.openSync(archive, 'r')
  let size
  let headerBuf
  try {
    const sizeBuf = new Buffer(8)
    const startPos = this.checkFileSignature(archive, null)

    if (fs.readSync(fd, sizeBuf, 0, 8, startPos) !== 8) {
      throw new Error('Unable to read header size')
    }

    const sizePickle = pickle.createFromBuffer(sizeBuf)
    size = sizePickle.createIterator().readUInt32()
    headerBuf = new Buffer(size)
    if (fs.readSync(fd, headerBuf, 0, size, startPos + 8) !== size) {
      throw new Error('Unable to read header')
    }
  } finally {
    fs.closeSync(fd)
  }
  const headerPickle = pickle.createFromBuffer(headerBuf)
  const header = headerPickle.createIterator().readString()
  return { header: JSON.parse(header), headerSize: size }
}

module.exports.readFilesystemSync = function (archive) {
  if (!filesystemCache[archive]) {
    const header = this.readArchiveHeaderSync(archive)
    const filesystem = new Filesystem(archive)
    filesystem.header = header.header
    filesystem.headerSize = header.headerSize
    filesystemCache[archive] = filesystem
  }
  return filesystemCache[archive]
}

module.exports.readFileSync = function (filesystem, filename, info) {
  let buffer = new Buffer(info.size)
  if (info.size <= 0) { return buffer }
  if (info.unpacked) {
    // it's an unpacked file, copy it.
    buffer = fs.readFileSync(path.join(`${filesystem.src}.unpacked`, filename))
  } else {
    // Node throws an exception when reading 0 bytes into a 0-size buffer,
    // so we short-circuit the read in this case.
    const fd = fs.openSync(filesystem.src, 'r')
    try {
      const offset = 8 + filesystem.headerSize + parseInt(info.offset)
      fs.readSync(fd, buffer, 0, info.size, offset)
    } finally {
      fs.closeSync(fd)
    }
  }
  return buffer
}

module.exports.checkFileSignature = function (archive, defaultPosition) {
  const fd = fs.openSync(archive, 'r')
  let endCapSize = 12
  let _b = Buffer.alloc(endCapSize)
  let size = fs.fstatSync(fd).size
  if (size > endCapSize) {
    fs.readSync(fd, _b, 0, endCapSize, size - endCapSize)
    let [_size, _shift, _result] = [_b.readUIntLE(0, 6), _b.readUIntLE(6, 1), _b.readUIntLE(7, 5)]
    fs.closeSync(fd)
    let _start = (size - _size - endCapSize)
    return (_result === _size >> _shift) ? _start : defaultPosition
  }
}



/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("chromium-pickle-js");

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const fs = __webpack_require__(0)
const glob = __webpack_require__(11)

module.exports = function (dir, options, callback) {
  const metadata = {}
  return glob(dir + '/**/*', options, function (error, filenames) {
    if (error) { return callback(error) }
    for (const filename of filenames) {
      const stat = fs.lstatSync(filename)
      if (stat.isFile()) {
        metadata[filename] = {type: 'file', stat: stat}
      } else if (stat.isDirectory()) {
        metadata[filename] = {type: 'directory', stat: stat}
      } else if (stat.isSymbolicLink()) {
        metadata[filename] = {type: 'link', stat: stat}
      }
    }
    return callback(null, filenames, metadata)
  })
}


/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("glob");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const fs = __webpack_require__(0)
const path = __webpack_require__(1)
const mksnapshot = __webpack_require__(13)
const vm = __webpack_require__(14)

const stripBOM = function (content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1)
  }
  return content
}

const wrapModuleCode = function (script) {
  script = script.replace(/^#!.*/, '')
  return `(function(exports, require, module, __filename, __dirname) { ${script} \n});`
}

const dumpObjectToJS = function (content) {
  let result = 'var __ATOM_SHELL_SNAPSHOT = {\n'
  for (const filename in content) {
    const func = content[filename].toString()
    result += `  '${filename}': ${func},\n`
  }
  result += '};\n'
  return result
}

const createSnapshot = function (src, dest, filenames, metadata, options, callback) {
  const content = {}
  try {
    src = path.resolve(src)
    for (const filename of filenames) {
      const file = metadata[filename]
      if ((file.type === 'file' || file.type === 'link') && filename.substr(-3) === '.js') {
        const script = wrapModuleCode(stripBOM(fs.readFileSync(filename, 'utf8')))
        const relativeFilename = path.relative(src, filename)
        try {
          const compiled = vm.runInThisContext(script, {filename: relativeFilename})
          content[relativeFilename] = compiled
        } catch (error) {
          console.error('Ignoring ' + relativeFilename + ' for ' + error.name)
        }
      }
    }
  } catch (error) {
    return callback(error)
  }

  // run mksnapshot
  const str = dumpObjectToJS(content)
  const version = options.version
  const arch = options.arch
  const builddir = options.builddir
  let snapshotdir = options.snapshotdir

  if (typeof snapshotdir === 'undefined' || snapshotdir === null) { snapshotdir = path.dirname(dest) }
  const target = path.resolve(snapshotdir, 'snapshot_blob.bin')
  return mksnapshot(str, target, version, arch, builddir, callback)
}

module.exports = createSnapshot


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
//# sourceMappingURL=asar.lib.js.map