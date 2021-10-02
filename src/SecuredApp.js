import React from "react";
import App from "./App";
import {
  AuthProvider, //	The provider is what will wrap the application and enable to use the associated context in our nested components,
  AuthService, //The service is the flow configuration for that particular application,
  useAuth, //  useAuth enables to lookup the context
} from "react-oauth2-pkce";

const authService = new AuthService({
  clientId: "ADD YOUR CLIENDID KEY",
  provider: "https://login.microsoftonline.com/common/oauth2/v2.0/",
  redirectUri: "http://localhost:3000",
  scopes: ["openid"],
});

function SecuredApp() {
  //Thanks to useAuth we can lookup the authService, in this particular case it is not critical since we have it at the top of the file but when using in nested components (wrapping them with withAuth from the same package) it is very useful,
  const { authService } = useAuth();

  //We create login and logout callback just delegating to authService - in async mode - to initiate the authentication flow or reset the stored data respectively,
  const login = async () => authService.authorize();
  const logout = async () => authService.logout();

  // If the authentication is pending (i.e. flow is in progress) we show some loading feedback component
  // (meterialized here by a simple "Loading" text), note that it can be neat to enable the user to stop the in progress
  // flow (if something goes wrong in background) or ensure there is a timeout on this state (if not set, start it using
  // setTimeout for example),
  if (authService.isPending()) {
    return (
      <div>
        Loading...
        <button
          onClick={() => {
            logout();
            login();
          }}
        >
          Reset
        </button>
      </div>
    );
  }

  //If the user is not authenticated - and flow is not pending here, show the anonymous view (materialized by the login button here),
  if (!authService.isAuthenticated()) {
    return (
      <div>
        <p>Not Logged in yet</p>
        <button onClick={login}>Login</button>
      </div>
    );
  }

  // If we reach this stage, we have a token (so we are authenticated), we can access the token with authService.getAuthTokens() and condition the rendering with it if it is a JWT,
  const token = authService.getAuthTokens();
  return (
    <div>
      <button onClick={logout}>Logout</button>
      <App />
    </div>
  );
}

function WrappedSecuredApp() {
  return (
    <AuthProvider authService={authService}>
      <SecuredApp />
    </AuthProvider>
  );
}

export default WrappedSecuredApp;
