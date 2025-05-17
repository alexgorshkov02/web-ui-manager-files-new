import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  from,
  createHttpLink,
} from "@apollo/client";
import { RestLink } from "apollo-link-rest";
import AuthLink from "./utils/authLink";
import { onError } from "@apollo/client/link/error";
import Cookies from "js-cookie";
import { BrowserRouter } from "react-router-dom";
const API_HOST = process.env.REACT_APP_API_HOST;
const API_PORT = process.env.REACT_APP_API_PORT;

const httpLink = createHttpLink({
  uri: `${API_HOST}:${API_PORT}/graphql`,
  credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-apollo-operation-name": "fallback",
            "apollo-require-preflight": "true",
         },
});

const restLink = new RestLink({
  uri: `${API_HOST}:${API_PORT}`,
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path, extensions }) => {
      // console.log("extensions.code: ", extensions.code);
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

      if (extensions.code === "UNAUTHENTICATED") {
        Cookies.remove("jwt");
        client.clearStore();
      }
      return null;
    });
  }
  if (networkError) {
    console.log(`[Netwok error]: ${networkError}`);
  }
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([errorLink, AuthLink, restLink, httpLink]),
  connectToDevTools: true,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
