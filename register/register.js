/* Hide and show login/signup menu */
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

/*validations */
const input = document.getElementsByClassName("input");
const signupBtn = document.getElementById("signup-btn"); // Asegúrate que tu botón de signup tenga id="signup-btn"

let user = {
    username: "",
    email: "",
    password: ""
}

for (let index = 0; index < input.length; index++) {
    input[index].addEventListener("input", () => {
        if (index == 2) {
            const value = input[index].value;
            const isValidUsernameChars = /^[a-zA-Z0-9_]+$/.test(value);
        // Signup username validation
            if (value.length < 5 || value.length > 20 || (value.length > 0 && !isValidUsernameChars)) { // Verifica longitud y caracteres válidos (si no está vacío)
                input[index].classList.remove("correct-input");
                input[index].classList.add("incorrect-input");
                if (input[index].value.length == 0) {
                    input[index].classList.remove("incorrect-input");
                }
            } else {
                input[index].classList.remove("incorrect-input");
                input[index].classList.add("correct-input");
            }
        }

        // Signup email validation
        if (index == 3) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input[index].value)) {
                input[index].classList.remove("correct-input");
                input[index].classList.add("incorrect-input");
                if (input[index].value.length == 0) {
                    input[index].classList.remove("incorrect-input");
                }
            } else {
                input[index].classList.remove("incorrect-input");
                input[index].classList.add("correct-input");
            }
        }

        // Signup password validation
        if (index == 4) {
            const value = input[index].value;
            if (value.length < 8) {
                input[index].classList.remove("correct-input");
                input[index].classList.add("incorrect-input");
                if (value.length == 0) {
                    input[index].classList.remove("incorrect-input");
                }
            } else {
                input[index].classList.remove("incorrect-input");
                input[index].classList.add("correct-input");
            }
            if (input.length > 5) input[5].dispatchEvent(new Event('input'));
        }

        // Signup re-password validation
        if (index == 5) {
            const value = input[index].value;
            const passwordValue = input[4].value; 
            if (value !== passwordValue || value.length === 0) {
                input[index].classList.remove("correct-input");
                input[index].classList.add("incorrect-input");
                 if (value.length == 0) {
                    input[index].classList.remove("incorrect-input");
                }
            } else {
                input[index].classList.remove("incorrect-input");
                input[index].classList.add("correct-input");
            }
        }
    })
}

// Event listener btn Sign Up
signupBtn.addEventListener("click", (event) => {
    event.preventDefault(); 

    // Correct info verify
    const isUsernameValid = input[2].classList.contains("correct-input");
    const isEmailValid = input[3].classList.contains("correct-input");
    const isPasswordValid = input[4].classList.contains("correct-input");
    const isRepeatPasswordValid = input[5].classList.contains("correct-input");

    if (isUsernameValid && isEmailValid && isPasswordValid && isRepeatPasswordValid) {
        // Save info
        user.username = input[2].value;
        user.email = input[3].value;
        user.password = input[4].value;

        console.log("User registered:", user);
    } else {
        console.log("User did not register:");
    }
});
