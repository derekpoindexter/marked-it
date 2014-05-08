var fs = require('fs');
var path = require('path');

var SWITCH_SOURCEDIR = "--sourceDir", SWITCH_DESTINATIONDIR = "--destinationDir", SWITCH_OVERWRITE = "-overwrite";
var EXTENSION_MARKDOWN = /\.md$/;
var SIZE_BLOCK = 4096;
var WRITE_PERMISSIONS = 0644;

var sourceDir, destinationDir, overwrite;

process.argv.forEach(function(arg) {
	if (arg.indexOf(SWITCH_SOURCEDIR) === 0 && arg.indexOf("=") !== -1) {
		sourceDir = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_DESTINATIONDIR) === 0 && arg.indexOf("=") !== -1) {
		destinationDir = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_OVERWRITE) === 0) {
		overwrite = true;
	}
});

if (!sourceDir || !destinationDir) {
	console.log("Usage: node markdownProcessor " + SWITCH_SOURCEDIR + "=<sourceDirectory> " + SWITCH_DESTINATIONDIR + "=<destinationDirectory> [" + SWITCH_OVERWRITE + "]");
	process.exit();
}

if (!fs.existsSync(sourceDir)) {
	console.log("Source directory does not exist: " + sourceDir);
	process.exit();	
}

if (!fs.existsSync(destinationDir)) {
	console.log("Destination directory does not exist: " + destinationDir);
	process.exit();	
}

var filenames = fs.readdirSync(sourceDir);
filenames.forEach(function(current) {
	if (current.test(EXTENSION_MARKDOWN)) {
		var sourcePath = path.join(sourceDir, current);
		fs.open(sourcePath, "r", null, function(err, fd) {
			if (fd) {
				var buffer = new Buffer(SIZE_BLOCK);
				var fileText = "";
				var bytesRead;
				do {
					bytesRead = fs.readSync(fd, buffer, 0, SIZE_BLOCK, null);
					fileText += buffer.toString("utf8", 0, bytesRead);
				} while (bytesRead === SIZE_BLOCK);
				if (!fileText.length) {
					console.log("Failed to read the content of file " + sourcePath);
				} else {
					var destinationPath = path.join(destinationDir, current);
					var writeFlags = overwrite ? "w" : "wx";
					fs.open(destinationPath, writeFlags, WRITE_PERMISSIONS, function(writeErr, writeFd) {
						if (writeFd) {
							var bytesWritten = 0;
							do {
								var writtenLength = fs.writeSync(writeFd, buffer, bytesWritten, SIZE_BLOCK, null);
								if (!writtenLength) {
									
								}
								bytesWritten += writtenLength;
							} while (bytesWritten < buffer.length);
						}
					});
				}
			}
		});
	}
});