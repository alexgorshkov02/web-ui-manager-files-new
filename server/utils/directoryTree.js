const PATH = require("path");
const dirTree = require("directory-tree");
const fs = require('fs');
const http = require('http'); 

//For testing (temp)
// const path = "C:\\testFolder\\";
// const path1 = "C:\\testFolder\\folder5\\files";

function directoryTree(path) {
  const tree = dirTree(path, { attributes:["type"], extensions: /\.txt$/ }, null, (item, currentPath, stats) => {
    item.path = PATH.basename(currentPath);
    item.relativePath = PATH.relative(path, currentPath);
    // console.log(item);
    // console.log(PATH);
    // console.log(stats);
  });
  // console.log("tree: ", tree);
  // addFieldToTree(tree, fieldName, currentPath);
  // console.log("tree: ", tree);
  // console.log(tree.children[0]);
  return tree;
}


function addFieldToTree(tree, fieldName, fieldValue) {
  // Add the field to the file node
  // console.log("fieldValue: ",fieldValue)
  tree[fieldName] = fieldValue;
  
  // Recursively process child nodes (if any)
  if (tree.children && tree.children.length > 0) {
    for (const child of tree.children) {
      addFieldToTree(child, fieldName, fieldValue);
    }
  }
}


function getFilesFromSelectedDirectory(rootDir, path, directory) {
  console.log("rootDir,path, directory: ", rootDir,path, directory)
  // let listOfFiles = [];
  const tree = dirTree(path, {attributes:["size", "type", "ctime"]}, null, (item, currentPath) => {
    item.path = PATH.basename(currentPath);
    item.relativePath = PATH.relative(rootDir, currentPath);
    // console.log("Item: ", item);
    // listOfFiles.push(item);
  });
  // const fieldName = "relativePath";
  // addFieldToTree(tree, fieldName, directory);

  // console.log("Modified tree: ", tree);
  return tree;



  // console.log("tree: ", tree);
  // console.log(tree.children[0]);
  // return tree;
}

//For testing (temp)
// const tree = directoryTree(path);
// console.log("Tree", tree);

// const tree1 = getFilesFromSelectedDirectory(path1);
// console.log("Tree", tree1);

module.exports = { directoryTree, getFilesFromSelectedDirectory};