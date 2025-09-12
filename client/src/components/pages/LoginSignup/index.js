import React, { useState } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import Sheet from "@mui/joy/Sheet";
import CssBaseline from "@mui/joy/CssBaseline";
import Typography from "@mui/joy/Typography";
import Link from "@mui/joy/Link";
import LoginForm from "../Login";
import SignupForm from "../Signup";

const LoginSignupForm = ({ changeLoginState, props }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <main>
      <div className="authModal">
        <CssVarsProvider {...props}>
          <CssBaseline />
          <Sheet
            sx={{
              width: 300,
              mx: "auto", // margin left & right
              my: 4, // margin top & bottom
              py: 3, // padding top & bottom
              px: 2, // padding left & right
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderRadius: "sm",
              boxShadow: "md",
            }}
            variant="outlined"
          >
            <div>
              <Typography level="h4" component="h1">
                <b>Welcome!</b>
              </Typography>
              <Typography level="body-sm">Sign in to continue.</Typography>
            </div>

            {showLogin && (
              <div>
                <LoginForm changeLoginState={changeLoginState} />
                <Typography
                  endDecorator={
                    <Link onClick={() => setShowLogin(false)}>Sign up</Link>
                  }
                  sx={{ fontSize: "sm", alignSelf: "center" }}
                >
                  Don&apos;t have an account?
                </Typography>
              </div>
            )}

            {!showLogin && (
              <div>
                <SignupForm changeLoginState={changeLoginState} />
                <Typography
                  endDecorator={
                    <Link onClick={() => setShowLogin(true)}>Sign in</Link>
                  }
                  sx={{ fontSize: "sm", alignSelf: "center" }}
                >
                  Already have an account?
                </Typography>
              </div>
            )}
          </Sheet>
        </CssVarsProvider>
      </div>
    </main>
  );
};

export default LoginSignupForm;
