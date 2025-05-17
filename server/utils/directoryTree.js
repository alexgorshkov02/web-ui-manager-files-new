const PATH = require("path");
const dirTree = require("directory-tree");
const fs = require("fs");

//For testing (temp)
// const path = "C:\\testFolder\\";
// const path1 = "C:\\testFolder\\folder5\\files";

function directoryTree(basePath) {
  console.log("directoryTree input:", basePath);
  if (!fs.existsSync(basePath)) {
    return null;
  }

  const tree = dirTree(
    basePath,
    { attributes: ["type"], extensions: /\.txt$/ },
    null,
    (item, currentPath, stats) => {
      // item.path = PATH.basename(currentPath);
      item.relativePath = PATH.relative(basePath, currentPath);
      // console.log(item);
      // console.log(PATH);
      // console.log(stats);
    }
  );
  // console.log("tree: ", tree);
  return tree || null;
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

// const getFilesFromSelectedDirectory = () => ({
//   children: [{ name: "file1.txt" }, { name: "file2.txt" }],
// });

function getFilesFromSelectedDirectory(rootDir, dirPath) {
//   console.log("[DEBUG] fs.existsSync check:", dirPath, "=>", fs.existsSync(dirPath));
// console.log("[DEBUG] process.cwd():", process.cwd());
// console.log("[DEBUG] __dirname:", __dirname);
// console.log("[DEBUG] __filename:", __filename);
// console.log("[DEBUG] Running as user:", process.getuid?.() ?? "N/A");

// try {
//   fs.writeFileSync("/srv/shared/testFolderLinux/__test.txt", "test");
//   console.log("[DEBUG] Successfully wrote test file");
// } catch (err) {
//   console.error("[ERROR] Cannot write test file:", err);
// }

// fs.existsSync('/srv/app-data/testFolderLinux') // should return true

  // Prevent scanning entire filesystem root
  const unsafeRoots = ['/', 'C:\\', 'C:/'];
  if (unsafeRoots.includes(dirPath) || unsafeRoots.includes(rootDir)) {
    console.warn("[SECURITY] Refusing to scan root directory:", dirPath);
    return null;
  }

  console.log("[INFO] Requested scan:");
  console.log("  Root Dir  :", rootDir);
  console.log("  Dir Path  :", dirPath);

  // Normalize and resolve full paths
  const normalizedRoot = PATH.resolve(rootDir);
  const normalizedDir = PATH.resolve(dirPath);

  console.log("  Normalized Root:", normalizedRoot);
  console.log("  Normalized Path:", normalizedDir);

  // Check existence
  if (!fs.existsSync(normalizedDir)) {
    console.warn("[WARN] Directory does not exist:", normalizedDir);
    return null;
  }

  let items;
  try {
    items = fs.readdirSync(normalizedDir);
  } catch (err) {
    console.error("[ERROR] Failed to read directory:", normalizedDir, err);
    return null;
  }

  const tree = {
    name: PATH.basename(normalizedDir),
    relativePath: PATH.relative(normalizedRoot, normalizedDir),
    size: 0,
    type: "directory",
    ctime: null,
    children: [],
  };

  for (const item of items) {
    const itemPath = PATH.join(normalizedDir, item);
    let itemStats;

    try {
      itemStats = fs.statSync(itemPath);
    } catch (err) {
      console.warn("[WARN] Could not stat:", itemPath, err);
      continue;
    }

    const itemInfo = {
      name: item,
      relativePath: PATH.relative(normalizedRoot, itemPath),
      size: itemStats.isFile() ? formatFileSize(itemStats.size) : null,
      type: itemStats.isFile() ? "file" : "directory",
      ctime: formatCtime(itemStats.ctime),
    };

    if (itemStats.isDirectory()) {
      itemInfo.children = getFilesFromSelectedDirectory(normalizedRoot, itemPath);
    }

    tree.children.push(itemInfo);
  }

  return tree;
}

//For testing (temp)
// const tree = directoryTree(path);
// console.log("Tree", tree);

// const tree1 = getFilesFromSelectedDirectory(path1);
// console.log("Tree", tree1);

module.exports = { directoryTree, getFilesFromSelectedDirectory };
