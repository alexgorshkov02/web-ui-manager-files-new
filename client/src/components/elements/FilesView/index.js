import React from "react";
import { makeStyles } from "@mui/styles";
import TreeItem from '@mui/lab/TreeItem';
import TreeView from "@mui/lab//TreeView";
import { gql, useQuery, useMutation } from '@apollo/client';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useState, useEffect } from 'react';
import { DataGrid } from "@mui/x-data-grid";

const GET_FILES = gql`
  query GetFiles ($directory: String) {
    files (directory: $directory) {
      name
      size
      ctime
    }
  }
`;


// Define mutation
const GET_FILES1 = gql`
mutation GetFiles($directory: String) {
  getFiles (directory: $directory) {
    name
    size
    ctime
  }
}
`;


export default function FilesView() {
      const [actualData, setEvent] = useState();
  const { loading, data, error, refetch } = useQuery(GET_FILES, {
    variables: { directory: 'C:\\testFolder\\folder2\\files' },
    onCompleted: (completedData) => { // onCompleted is a standard useQuery option
        // console.error("completedData: ", completedData);
        setEvent(completedData.files);
    },
  });





   const [getFiles] = useMutation(GET_FILES1, {
    refetchQueries: [
      {
        query:GET_FILES,
        variables: {directory: "C:\\testFolder\\folder5\\files"},
        // onCompleted: setEvent(count)
      }
    ]
  });

  if (loading) return "Loading...";
  if (error) {
    // Handle any errors that occurred during the query
    console.error(error);
    return <div>{error.message}</div>;
}

// if (data) {
//       console.log("TEST DATAAAAAAAAAAAAAAAAAAAAAS: ", data);
// //   const files = data.files;  
// //   console.log("TEST DATA: ", refetch);
// //   setEvent(files);
// }







 

  async function handleClick() {
    // setEvent(count + 1);


    const response = await getFiles({variables: { directory: "C:\\testFolder\\folder5\\files" }});
    const actualData = response.data.getFiles;
    console.log(actualData);
    setEvent(actualData);
  }

 
  


  return (
    <div onClick={() => handleClick()} style={{ height: 400, width: "100%" }}>
      <DataGrid 
        getRowId={(row) => row.name}
        columns={[
          { field: "name", headerName: "Name" },
          { field: "size", headerName: "Size" },
          { field: "ctime", headerName: "Date" },
        ]}
        rows={actualData}
      />
    </div>
  );
}
