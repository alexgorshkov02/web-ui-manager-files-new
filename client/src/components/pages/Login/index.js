import React, { useState } from "react";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import Cookies from "js-cookie";
import Loading from "../../elements/Loading";
import { useLoginMutation } from "../../../apollo/mutations";

const LoginForm = ({ changeLoginState }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [serverError, setServerError] = useState(""); // GraphQL/backend error
  const [login, { loading }] = useLoginMutation();

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
      const { data } = await login({
        variables: { username: username, password: password },
      });

      if (data.login.token) {
        Cookies.set("jwt", data.login.token);
        changeLoginState(true);
      }
    } catch (err) {
      setServerError("Login failed. Please check your credentials.");
      setUsername(""); // clear input
      setPassword(""); // clear input
    }
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
            onChange={(event) => setUsername(event.target.value)}
          />
        </FormControl>

        <FormControl error={Boolean(localError && !password)}>
          <FormLabel>Password</FormLabel>
          <Input
            // html input attribute
            name="password"
            type="password"
            placeholder="password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormControl>

        {/* Error message block */}
        {(localError || serverError) && (
          <Typography color="danger" fontSize="sm" sx={{ mt: 1 }}>
            {localError || serverError}
          </Typography>
        )}

        <Button sx={{ mt: 3 /* margin top */, width: "100%" }} type="submit">
          Log in
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
