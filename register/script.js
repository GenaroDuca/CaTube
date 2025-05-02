const loginMenu = document.getElementById("login-panel");
const signupMenu = document.getElementById("signup-panel");

document.getElementById("go-to-signup").addEventListener("click", () => {
    loginMenu.classList.remove("active");
    signupMenu.classList.add("active");
});

document.getElementById("go-to-login").addEventListener("click", () => {
    signupMenu.classList.remove("active");
    loginMenu.classList.add("active");
});

