import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import TreeStructureView from '../../elements/TreeStructureView';
import FilesView from '../../elements/FilesView';
// import { styled, createTheme, ThemeProvider } from '@mui/system';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';

const drawerWidth = 240;

// const MyComponent = styled('div')({
//   color: 'darkslategray',
//   backgroundColor: 'aliceblue',
//   padding: 8,
//   borderRadius: 4,
// });



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

export default function PermanentDrawerLeft() {

  const [count, setCount] = useState(0);
  const { loading, data, error, refetch } = useQuery(GET_FILES, {
    variables: { directory: 'InitialLoading' }
  });
  console.log("TEST DATA: ", refetch);




  const [getFiles] = useMutation(GET_FILES1, {
    refetchQueries: [
      {
        query:GET_FILES,
        variables: {directory: "C:\\testFolder\\folder5\\files"},
        awaitRefetchQueries: true,
        fetchPolicy: "network-only"
      }
      
    ]
  });

  async function handleClick() {
    setCount(count + 1);


    const response = await getFiles({variables: { directory: "C:\\testFolder\\folder5\\files" }});
    const files = response.data.getFiles;
    console.log(files);
  }




  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Permanent drawer
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List>
          <TreeStructureView />
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default' }}
      >
        <Toolbar />
        <FilesView />
      </Box>
    </Box>
  );
}