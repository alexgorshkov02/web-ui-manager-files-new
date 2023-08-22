import React, { useState } from "react";
import { useSignupMutation } from "../../../apollo/mutations";

const SignupForm = ({ changeLoginState }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signup, { loading, error }] = useSignupMutation();

  if (loading) return "Loading...";
  if (error) {
    // Handle any errors that occurred during the query
    console.error(error);
    return <div>{error.message}</div>;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    signup({
      update(cache, { data: { signup } }) {
        if (signup.token) {
          localStorage.setItem("jwt", signup.token);
          changeLoginState(true);
        }
      },
      variables: { username, password },
    });
  };

  return (
    <div className="login">
      {!loading && (
        <form onSubmit={onSubmit}>
          <label>Username</label>
          <input type="text" onChange={(event) => setUsername(event.target.value)} />
          <label>Password</label>
          <input type="password" onChange={(event) => setPassword(event.target.value)} />
          <input type="submit" value="Sign Up" />
        </form>
      )}
    </div>
  );
};

export default SignupForm;