/* --- Show/Hide Login and Signup Panels --- */
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

/* --- Input Validations --- */
const inputs = document.getElementsByClassName("input");
const signupBtn = document.getElementById("signup-btn");

for (let i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener("input", () => {
    const value = inputs[i].value;

    // Username validation (index 2)
    if (i === 2) {
      const validChars = /^[a-zA-Z0-9_]+$/.test(value);
      if (value.length < 5 || value.length > 20 || (value.length > 0 && !validChars)) {
        inputs[i].classList.add("incorrect-input");
        inputs[i].classList.remove("correct-input");
        if (value.length === 0) inputs[i].classList.remove("incorrect-input");
      } else {
        inputs[i].classList.add("correct-input");
        inputs[i].classList.remove("incorrect-input");
      }
    }

    // Email validation (index 3)
    if (i === 3) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!emailOk) {
        inputs[i].classList.add("incorrect-input");
        inputs[i].classList.remove("correct-input");
        if (value.length === 0) inputs[i].classList.remove("incorrect-input");
      } else {
        inputs[i].classList.add("correct-input");
        inputs[i].classList.remove("incorrect-input");
      }
    }

    // Password validation (index 4)
    if (i === 4) {
      if (value.length < 8) {
        inputs[i].classList.add("incorrect-input");
        inputs[i].classList.remove("correct-input");
        if (value.length === 0) inputs[i].classList.remove("incorrect-input");
      } else {
        inputs[i].classList.add("correct-input");
        inputs[i].classList.remove("incorrect-input");
      }
      // Trigger re-password validation
      if (inputs.length > 5) inputs[5].dispatchEvent(new Event('input'));
    }

    // Repeat password validation (index 5)
    if (i === 5) {
      const passwordValue = inputs[4].value;
      if (value !== passwordValue || value.length === 0) {
        inputs[i].classList.add("incorrect-input");
        inputs[i].classList.remove("correct-input");
        if (value.length === 0) inputs[i].classList.remove("incorrect-input");
      } else {
        inputs[i].classList.add("correct-input");
        inputs[i].classList.remove("incorrect-input");
      }
    }
  });
}

/* --- Signup Button Click --- */
signupBtn.addEventListener("click", (event) => {
  event.preventDefault();

  const isUsernameValid = inputs[2].classList.contains("correct-input");
  const isEmailValid = inputs[3].classList.contains("correct-input");
  const isPasswordValid = inputs[4].classList.contains("correct-input");
  const isRepeatPasswordValid = inputs[5].classList.contains("correct-input");

  if (isUsernameValid && isEmailValid && isPasswordValid && isRepeatPasswordValid) {
    // Simulate user registration
    const user = {
      username: inputs[2].value,
      email: inputs[3].value,
      password: inputs[4].value
    };
    console.log("User registered:", user);
  } else {
    console.log("User did not register: invalid input");
  }
});
