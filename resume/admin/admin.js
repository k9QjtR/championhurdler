const COGNITO_DOMAIN =
  "https://us-east-2tlrwcuik4.auth.us-east-2.amazoncognito.com";

const CLIENT_ID =
  "6tshfqmsongku6ve2p09j40ji0";

const REDIRECT_URI =
  "https://resume.championhurdler.com/admin/";

const LOGOUT_URI =
  "https://resume.championhurdler.com/";

const SCOPES =
  "openid email";


document.addEventListener("DOMContentLoaded", async () => {

  document
    .getElementById("login-button")
    .addEventListener("click", login);

  document
    .getElementById("logout-button")
    .addEventListener("click", logout);

  await handleAuthentication();

});


async function handleAuthentication() {

  const params =
    new URLSearchParams(window.location.search);

  const code = params.get("code");

  if (code) {

    try {

      setStatus("Completing sign in...");

      await exchangeCodeForTokens(code);

      // Remove authorization code from URL
      window.history.replaceState(
        {},
        document.title,
        "/admin/"
      );

    } catch (error) {

      console.error(
        "Authentication failed:",
        error
      );

      clearTokens();

    }

  }

  updateUI();

}


async function login() {

  /*
   * PKCE requires:
   *
   * code_verifier
   *      ↓ SHA-256
   * code_challenge
   */

  const verifier =
    generateCodeVerifier();

  const challenge =
    await generateCodeChallenge(verifier);

  sessionStorage.setItem(
    "pkce_code_verifier",
    verifier
  );

  const authorizationUrl =
    new URL(`${COGNITO_DOMAIN}/oauth2/authorize`);

  authorizationUrl.searchParams.set(
    "response_type",
    "code"
  );

  authorizationUrl.searchParams.set(
    "client_id",
    CLIENT_ID
  );

  authorizationUrl.searchParams.set(
    "redirect_uri",
    REDIRECT_URI
  );

  authorizationUrl.searchParams.set(
    "scope",
    SCOPES
  );

  authorizationUrl.searchParams.set(
    "code_challenge_method",
    "S256"
  );

  authorizationUrl.searchParams.set(
    "code_challenge",
    challenge
  );

  window.location.href =
    authorizationUrl.toString();

}


async function exchangeCodeForTokens(code) {

  const verifier =
    sessionStorage.getItem(
      "pkce_code_verifier"
    );

  if (!verifier) {
    throw new Error(
      "PKCE verifier not found."
    );
  }

  const body =
    new URLSearchParams();

  body.set(
    "grant_type",
    "authorization_code"
  );

  body.set(
    "client_id",
    CLIENT_ID
  );

  body.set(
    "code",
    code
  );

  body.set(
    "redirect_uri",
    REDIRECT_URI
  );

  body.set(
    "code_verifier",
    verifier
  );

  const response =
    await fetch(
      `${COGNITO_DOMAIN}/oauth2/token`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body: body.toString()
      }
    );

  if (!response.ok) {

    const error =
      await response.text();

    throw new Error(
      `Token exchange failed: ${error}`
    );

  }

  const tokens =
    await response.json();

  /*
   * Store tokens in sessionStorage.
   *
   * They disappear when the browser
   * session/tab is closed.
   */

  sessionStorage.setItem(
    "access_token",
    tokens.access_token
  );

  sessionStorage.setItem(
    "id_token",
    tokens.id_token
  );

  if (tokens.refresh_token) {

    sessionStorage.setItem(
      "refresh_token",
      tokens.refresh_token
    );

  }

  sessionStorage.removeItem(
    "pkce_code_verifier"
  );

}


function logout() {

  clearTokens();

  const logoutUrl =
    new URL(`${COGNITO_DOMAIN}/logout`);

  logoutUrl.searchParams.set(
    "client_id",
    CLIENT_ID
  );

  logoutUrl.searchParams.set(
    "logout_uri",
    LOGOUT_URI
  );

  window.location.href =
    logoutUrl.toString();

}


function updateUI() {

  const idToken =
    sessionStorage.getItem(
      "id_token"
    );

  const authenticated =
    document.getElementById(
      "authenticated"
    );

  const unauthenticated =
    document.getElementById(
      "unauthenticated"
    );

  if (idToken && !isTokenExpired(idToken)) {

    authenticated.style.display =
      "block";

    unauthenticated.style.display =
      "none";

    setStatus(
      "Signed in successfully."
    );

  } else {

    clearTokens();

    authenticated.style.display =
      "none";

    unauthenticated.style.display =
      "block";

    setStatus(
      "Sign in to manage the resume."
    );

  }

}


function clearTokens() {

  sessionStorage.removeItem(
    "access_token"
  );

  sessionStorage.removeItem(
    "id_token"
  );

  sessionStorage.removeItem(
    "refresh_token"
  );

}


function isTokenExpired(token) {

  try {

    const payload =
      JSON.parse(
        atob(
          token.split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

    const now =
      Math.floor(Date.now() / 1000);

    return payload.exp <= now;

  } catch {

    return true;

  }

}


function generateCodeVerifier() {

  const array =
    new Uint8Array(64);

  crypto.getRandomValues(array);

  return base64UrlEncode(array);

}


async function generateCodeChallenge(
  verifier
) {

  const data =
    new TextEncoder()
      .encode(verifier);

  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );

  return base64UrlEncode(
    new Uint8Array(digest)
  );

}


function base64UrlEncode(buffer) {

  let binary = "";

  buffer.forEach(byte => {
    binary +=
      String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

}


function setStatus(message) {

  document
    .getElementById("status")
    .textContent = message;

}