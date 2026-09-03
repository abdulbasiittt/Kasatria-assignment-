// Google Login Callback

function handleCredentialResponse(response) {
    console.log("Google credential received.");
    console.log(response);

    try {
        const userData = parseJwt(response.credential);

        console.log("Logged-in user:");
        console.log(userData);

        // Get page elements
        const loginScreen = document.querySelector(".login-screen");
        const appScreen = document.querySelector(".app-screen");
        const userName = document.querySelector("#user-name");
        const userEmail = document.querySelector("#user-email");

        // Make sure elements exist
        if (!loginScreen) {
            console.error("ERROR: .login-screen was not found.");
            return;
        }

        if (!appScreen) {
            console.error("ERROR: .app-screen was not found.");
            return;
        }

        // Display user information
        if (userName) {
            userName.textContent = userData.name || "Google User";
        }

        if (userEmail) {
            userEmail.textContent = userData.email || "";
        }

        // Switch from login to application
        loginScreen.style.display = "none";
        appScreen.style.display = "block";

        console.log("Login screen hidden.");
        console.log("Application screen displayed.");

    } catch (error) {
        console.error("Google login processing failed:");
        console.error(error);

        alert(
            "Google login was successful, but the webpage could not process the login information."
        );
    }
}

// JWT Decoder

function parseJwt(token) {
    if (!token) {
        throw new Error("No Google credential was received.");
    }

    // JWT format: header.payload.signature
    const parts = token.split(".");

    if (parts.length !== 3) {
        throw new Error("Invalid Google credential format.");
    }

    const base64Url = parts[1];

    const base64 = base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map(function (character) {
                return "%" +
                    ("00" + character.charCodeAt(0).toString(16))
                    .slice(-2);
            })
            .join("")
    );

    return JSON.parse(jsonPayload);
}
