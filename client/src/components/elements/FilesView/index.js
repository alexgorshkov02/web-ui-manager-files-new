import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { gql, useQuery } from "@apollo/client";

const GET_FILES = gql`
  query getFiles {
    files {
      name
      size
      ctime
    }
  }
`;

export default function FilesView() {
  const { loading, data, error } = useQuery(GET_FILES);
  console.log("TEST DATA: ", data);

  if (loading) return "Loading...";
  if (error) return <div>{error.message}</div>;

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        getRowId={(row) => row.name}
        columns={[
          { field: "name", headerName: "Name" },
          { field: "size", headerName: "Size" },
          { field: "ctime", headerName: "Date" },
        ]}
        rows={data.files}
      />
    </div>
  );
}
