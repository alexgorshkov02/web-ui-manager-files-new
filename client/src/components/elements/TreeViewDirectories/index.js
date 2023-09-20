import TreeItem from "@mui/lab/TreeItem";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function TreeViewDirectories({ expanded, selected, directories, handleClick}) {
  const renderItem = (node) => {
    // console.log("parentName: ", parentName);
    // console.log("Type: ", node);
    // console.log("parentName: ", parentName + " + node.path: " + node.path);
    // console.log("node.name: ", node);
    return (
      <TreeItem
        onClick={() => handleClick(node.relativePath)}
        key={node.name}
        nodeId={node.relativePath}
        label={node.name}
      >
        {Array.isArray(node.children)
          ? node.children
              .filter((child) => child.type === "directory")
              .map((child) => renderItem(child))
          : null}
      </TreeItem>
    );
  };

  //To exclude the root folder
  const renderTree = (nodes) =>
    Array.isArray(nodes)
      ? nodes
          .filter((node) => node.type === "directory")
          .map((node) => renderItem(node))
      : null;

  return (
    <TreeView
      sx={{ height: 110, flexGrow: 1, maxWidth: 400 }}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      // Use the expanded state
      expanded={expanded}
      selected={selected}
    >
      {renderTree(directories)}
    </TreeView>
  );
}
