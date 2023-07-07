import React from "react";
import { makeStyles } from "@mui/styles";
import TreeItem from '@mui/lab/TreeItem';
import TreeView from "@mui/lab//TreeView";
import { gql, useQuery } from '@apollo/client';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";


const GET_DIRECTORIES = gql`
query GetDirectories {
  directories {
    name
    path
    children {
      name
      path
      children {
        name
        path
        children {
          name
          path
          children {
            name
            path
          }
        }
      }
    }
  }
}
`;

const useStyles = makeStyles({
  root: {
    height: 110,
    flexGrow: 1,
    maxWidth: 400,
  },
});

export default function TreeStructureView() {
  const { loading, data, error } = useQuery(GET_DIRECTORIES);
  const classes = useStyles();

  const renderItem = (node) => {
    console.log("Folder: ", node);

    return (
    <TreeItem key={node.name} nodeId={node.name} label={node.name}>
    {Array.isArray(node.children)
      ? node.children.map((children) => {
        console.log("Subfolder name: ", children.name);
        return <TreeItem key={children.path} nodeId={node.name + children.name} label={children.name} />
      })
      : null}
      </TreeItem>
    )
    };

  const renderTree = (nodes) => 
    Array.isArray(nodes.children)
      ? nodes.children.map((node) => renderItem(node))
      : null;
  

  if (loading) return "Loading...";
  if (error) return <div>{error.message}</div>;

  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpanded={["root"]}
      defaultExpandIcon={<ChevronRightIcon />}
    >
      {renderTree(data.directories)}
    </TreeView>
  );
}
