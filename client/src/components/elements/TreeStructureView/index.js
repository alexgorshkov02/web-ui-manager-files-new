import React from "react";
// import { makeStyles } from "@mui/styles";
import TreeItem from '@mui/lab/TreeItem';
import TreeView from "@mui/lab//TreeView";
import { gql, useQuery, useMutation } from '@apollo/client';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useState } from 'react';


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


// Define mutation
const GET_FILES = gql`
mutation GetFiles($directory: String) {
  getFiles (directory: $directory) {
    name
    size
    ctime
  }
}
`;


const GET_FILES1 = gql`
  query GetFiles ($directory: String) {
    files (directory: $directory) {
      name
      size
      ctime
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
  const [count, setCount] = useState(0);
  const { loading, data, error } = useQuery(GET_DIRECTORIES);
  // const classes = useStyles();
  const [getFiles] = useMutation(GET_FILES, {
    refetchQueries: [
      {
        query:GET_FILES1,
        variables: {directory: "C:\\testFolder\\folder5\\files"},
        awaitRefetchQueries: true,
        fetchPolicy: "network-only"
      }
    ]
  });

  async function handleClick(path) {
    if (typeof path !== 'string') {
      throw new Error('The "path" argument must be a string.');
    }
    setCount(count + 1);
    const type = typeof(path);
    console.log("Type(TEST!!!): ", type);
    console.log("Count(TEST!!!): ", path);
    const response = await getFiles({variables: { directory: "C:\\testFolder\\folder5\\files" }});
    const files = response.data.getFiles;
    console.log(files);
  }


 
  const renderItem = (node) => {
    // console.log("Folder: ", node);
    return (
    <TreeItem key={node.name} nodeId={node.name} label={node.name}>
    {Array.isArray(node.children)
      ? node.children.map((child) => {
        // console.log("Subfolder name: ", children.name);
        return <TreeItem onClick={() => handleClick(child.path)} key={child.path} nodeId={node.name + child.name} label={child.name} />
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
      sx={{ height: 110, flexGrow: 1, maxWidth: 400}}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpanded={["root"]}
      defaultExpandIcon={<ChevronRightIcon />}
    >
      {renderTree(data.directories)}
    </TreeView>
  );
}
