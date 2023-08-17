const PATH = require("path");
const dirTree = require("directory-tree");
const fs = require('fs');
const http = require('http'); 

//For testing (temp)
// const path = "C:\\testFolder\\";
// const path1 = "C:\\testFolder\\folder5\\files";

function directoryTree(path) {
  const tree = dirTree(path, { attributes:["type"], extensions: /\.txt$/ }, (item, PATH, stats) => {
    // console.log(item);
    // console.log(PATH);
    // console.log(stats);
  });

  // console.log(tree);
  // console.log(tree.children[0]);
  return tree;
}


function getFilesFromSelectedDirectory(path) {
  let listOfFiles = [];
  dirTree(path, {attributes:["size", "type", "ctime"]}, (item) => {
    // console.log("Item: ", item);
    listOfFiles.push(item);
  });

//   console.log(tree);
  // console.log(tree.children[0]);
  return listOfFiles;
}

//For testing (temp)
// const tree = directoryTree(path);
// console.log("Tree", tree);

// const tree1 = getFilesFromSelectedDirectory(path1);
// console.log("Tree", tree1);

module.exports = { directoryTree, getFilesFromSelectedDirectory};