import React, { useState } from "react";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import Cookies from "js-cookie";
import Loading from "../../elements/Loading";
import { useSignupMutation } from "../../../apollo/mutations";

const SignupForm = ({ changeLoginState }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [serverError, setServerError] = useState(""); // GraphQL/backend error
  const [signup, { loading }] = useSignupMutation();

  const onSubmit = async (event) => {
    event.preventDefault();

    // Clear previous errors
    setLocalError("");
    setServerError("");

    // Empty field check
    if (!username || !password) {
      setLocalError("Both username and password are required.");
      return;
    }

    try {
      await signup({
        update(cache, { data: { signup } }) {
          if (signup?.token) {
            Cookies.set("jwt", signup.token);
            changeLoginState(true);
          } else {
            setServerError("Signup failed. Try again.");
          }
        },
        variables: { username, password },
      });
    } catch (err) {
      // Try to pull GraphQL error message
      const gqlMsg = err.graphQLErrors?.[0]?.message || err.message;
      setServerError(formatGraphQLError(gqlMsg));
      setUsername(""); // clear input
      setPassword(""); // clear input
    }
  };

  const formatGraphQLError = (msg) => {
    if (msg.includes("password") && msg.includes("minimum allowed length")) {
      return "Password must be at least 5 characters long.";
    }
    if (msg.toLowerCase().includes("user already exists")) {
      return "Username is already taken.";
    }
    return "Signup failed. Please try again.";
  };

  if (loading) return <Loading />;

  return (
    <div className="login">
      <form onSubmit={onSubmit}>
        <FormControl error={Boolean(localError && !username)}>
          <FormLabel>Username</FormLabel>
          <Input
            // html input attribute
            name="username"
            type="username"
            placeholder="username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>

        <FormControl error={Boolean(localError && !password)}>
          <FormLabel>Password</FormLabel>
          <Input
            // html input attribute
            name="password"
            type="password"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>

        {/* Error message block */}
        {(localError || serverError) && (
          <Typography color="danger" fontSize="sm" sx={{ mt: 1 }}>
            {localError || serverError}
          </Typography>
        )}

        <Button sx={{ mt: 3 /* margin top */, width: "100%" }} type="submit">
          Sign up
        </Button>
      </form>
    </div>
  );
};

export default SignupForm;
