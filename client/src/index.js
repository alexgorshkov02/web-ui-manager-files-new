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

const httpLink = createHttpLink({
  uri: "http://localhost:3001/graphql",
  credentials: "same-origin",
});

const restLink = new RestLink({
  uri: "http://localhost:3001",
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
