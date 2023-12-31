const PATH = require("path");
const dirTree = require("directory-tree");
const fs = require("fs");

//For testing (temp)
// const path = "C:\\testFolder\\";
// const path1 = "C:\\testFolder\\folder5\\files";

function directoryTree(path) {
  const tree = dirTree(
    path,
    { attributes: ["type"], extensions: /\.txt$/ },
    null,
    (item, currentPath, stats) => {
      // item.path = PATH.basename(currentPath);
      item.relativePath = PATH.relative(path, currentPath);
      // console.log(item);
      // console.log(PATH);
      // console.log(stats);
    }
  );
  // console.log("tree: ", tree);
  return tree;
}

// Converts ctime to a human-readable date string
function formatCtime(ctime) {
  return new Date(ctime).toLocaleString();
}

// Converts file sizes to human-readable format
function formatFileSize(bytes) {
  if (bytes === null) return "N/A";
  if (bytes === 0) return "0 KB";
  const sizes = ["KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  if (i === 0) {
    return bytes.toFixed(1) + " " + sizes[i];
  }

  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

function getFilesFromSelectedDirectory(rootDir, dirPath) {
  // console.log(rootDir, dirPath);
  const items = fs.readdirSync(dirPath);

  const tree = {
    name: PATH.basename(dirPath),
    relativePath: PATH.relative(rootDir, dirPath),
    size: 0,
    type: "directory",
    ctime: null,
    children: [],
  };

  items.forEach((item) => {
    const itemPath = PATH.join(dirPath, item);
    const itemStats = fs.statSync(itemPath);

    const itemInfo = {
      name: item,
      relativePath: PATH.relative(rootDir, itemPath),
      size: itemStats.isFile() ? formatFileSize(itemStats.size) : null,
      type: itemStats.isFile() ? "file" : "directory",
      ctime: formatCtime(itemStats.ctime),
    };

    if (itemStats.isDirectory()) {
      itemInfo.children = getFilesFromSelectedDirectory(rootDir, itemPath);
    }

    tree.children.push(itemInfo);
  });

  // console.log("tree: ", tree);
  return tree;
}

//For testing (temp)
// const tree = directoryTree(path);
// console.log("Tree", tree);

// const tree1 = getFilesFromSelectedDirectory(path1);
// console.log("Tree", tree1);

module.exports = { directoryTree, getFilesFromSelectedDirectory };
