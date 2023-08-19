import { gql, useMutation } from "@apollo/client";
import React, { useState } from "react";

const LOGIN = gql`
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    token
  }
}
`;

const SIGNUP = gql`
mutation AddUser($username: String!, $password: String!) {
  addUser(username: $username, password: $password) {
    token
  }
}
`;

const LoginForm = ({ changeLoginState }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { loading, error }] = useMutation(LOGIN);

  if (loading) return "Loading...";
  if (error) {
    // Handle any errors that occurred during the query
    console.error(error);
    return <div>{error.message}</div>;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await login({
        variables: { username: username, password: password },
      });
  
      if (data.login.token) {
        localStorage.setItem("jwt", data.login.token);
        changeLoginState(true);
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };
  return (
    <div className="login">
      <form onSubmit={onSubmit}>
        <label>Username</label>
        <input
          type="text"
          onChange={(event) => setUsername(event.target.value)}
        />
        <label>Password</label>
        <input
          type="password"
          onChange={(event) => setPassword(event.target.value)}
        />
        <input type="submit" value="Login" />
      </form>
    </div>
  );
};

export default LoginForm;