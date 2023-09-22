import React, { useState } from "react";
import { useSignupMutation } from "../../../apollo/mutations";
import Cookies from "js-cookie";
import Loading from "../../elements/Loading";

const SignupForm = ({ changeLoginState }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signup, { loading, error }] = useSignupMutation();

  if (loading) return <Loading />;
  if (error) {
    console.error(error);
    return <div>{error.message}</div>;
  }

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      await signup({
        update(cache, { data: { signup } }) {
          if (signup.token) {
            Cookies.set("jwt", signup.token);
            changeLoginState(true);
          }
        },
        variables: { username, password },
      });
    } catch (error) {
      console.error("Error signing up : ", error);
    }
  };

  return (
    <div className="login">
      {!loading && (
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
          <input type="submit" value="Sign Up" />
        </form>
      )}
    </div>
  );
};

export default SignupForm;
