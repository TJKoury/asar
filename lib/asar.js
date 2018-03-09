'use strict'
const fs = require('fs')
const path = require('path')
const minimatch = require('minimatch')
const mkdirp = require('mkdirp')

const Filesystem = require('./filesystem')
const disk = require('./disk')

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

module.exports.uncache = function (archive) {
  return disk.uncacheFilesystem(archive)
}

module.exports.uncacheAll = function () {
  disk.uncacheAll()
}
