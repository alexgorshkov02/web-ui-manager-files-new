import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloClient, InMemoryCache, ApolloProvider, from, createHttpLink } from '@apollo/client';
import { RestLink } from 'apollo-link-rest';


//WA: https://github.com/apollographql/apollo-link-rest/issues/172
const httpLink = createHttpLink({
  uri: 'http://localhost:3001/graphql',
});

const restLink = new RestLink({
  uri: 'http://localhost:3001',
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([restLink, httpLink]),
  connectToDevTools: true,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
