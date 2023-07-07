const PATH = require('path');
const dirTree = require('directory-tree');

function directoryTree (path) {
    const tree = dirTree(path, {extensions:/\.txt$/}, (item, PATH, stats) => {
        console.log(item);
        console.log(PATH);
        console.log(stats);
    });

    // console.log(tree);
    // console.log(tree.children[0]);
        return tree;
    }


    module.exports = directoryTree;