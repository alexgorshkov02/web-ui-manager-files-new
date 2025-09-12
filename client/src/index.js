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

// === Configuration ===
const NODE_ENV = process.env.NODE_ENV || "development";
const API_PROTOCOL = NODE_ENV === "production" ? "https" : "http";
const API_HOST = process.env.REACT_APP_API_HOST || "localhost";
const API_PORT = process.env.REACT_APP_API_PORT || 3001;

// Build URI with optional port
const isDefaultPort =
  (API_PROTOCOL === "http" && API_PORT === "80") ||
  (API_PROTOCOL === "https" && API_PORT === "443");

const portSegment = API_PORT && !isDefaultPort ? `:${API_PORT}` : "";
const BASE_URI = `${API_PROTOCOL}://${API_HOST}${portSegment}`;

// === Apollo Links ===
const httpLink = createHttpLink({
  uri: `${BASE_URI}/graphql`,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "x-apollo-operation-name": "fallback",
    "apollo-require-preflight": "true",
  },
});

const restLink = new RestLink({
  uri: BASE_URI,
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {

      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      }
      
      if (extensions?.code === "UNAUTHENTICATED") {
        Cookies.remove("jwt");
        client.clearStore();
      }
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([errorLink, AuthLink, restLink, httpLink]),
  connectToDevTools: true,
});

// === Render ===
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
