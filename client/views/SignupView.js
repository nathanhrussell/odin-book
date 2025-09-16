import api from "../src/api.js";
import { navigate } from "../src/router.js";

export function SignupView() {
  const el = document.createElement("main");
  el.className = "min-h-screen w-full flex items-center justify-center";
  // Ensure full viewport purple background
  document.body.style.backgroundColor = "#6B4CAD";
  el.innerHTML = `
    <div class="w-full max-w-md p-10 space-y-8 bg-transparent rounded-none shadow-none flex flex-col items-center justify-start min-h-screen" style="padding-top: 40px;">
  <img src="/odinbooklogovector.svg" alt="Odin Book" class="mx-auto w-100 h-100 mb-4" />
      <h2 class="text-3xl font-extrabold text-center text-white mb-6">Sign Up</h2>
      <form id="signup-form" class="space-y-8 w-full">
        <div>
          <label class="block mb-3 text-lg font-medium text-white">Email</label>
          <input type="email" id="signup-email" class="w-full px-5 py-4 border border-gray-300 rounded-lg text-lg" required />
          <div id="signup-email-error" class="text-base text-red-200 mt-2"></div>
        </div>
        <div>
          <label class="block mb-3 text-lg font-medium text-white">Password</label>
          <input type="password" id="signup-password" class="w-full px-5 py-4 border border-gray-300 rounded-lg text-lg" required />
          <div id="signup-password-error" class="text-base text-red-200 mt-2"></div>
        </div>
        <div>
          <label class="block mb-3 text-lg font-medium text-white">Confirm Password</label>
          <input type="password" id="signup-confirm-password" class="w-full px-5 py-4 border border-gray-300 rounded-lg text-lg" required />
          <div id="signup-confirm-password-error" class="text-base text-red-200 mt-2"></div>
        </div>
        <div id="signup-server-error" class="text-base text-red-200 mb-2"></div>
        <button type="submit" class="w-full py-4 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 text-xl">Sign Up</button>
      </form>
      <div class="text-center mt-8 text-lg">
        <span class="text-white">Already have an account?</span>
        <button class="ml-2 text-black-200 hover:underline font-semibold text-lg" id="to-login">Sign In</button>
      </div>
    </div>
  `;

  const form = el.querySelector("#signup-form");
  const emailInput = el.querySelector("#signup-email");
  const passwordInput = el.querySelector("#signup-password");
  const confirmInput = el.querySelector("#signup-confirm-password");
  const emailError = el.querySelector("#signup-email-error");
  const passwordError = el.querySelector("#signup-password-error");
  const confirmError = el.querySelector("#signup-confirm-password-error");
  const serverError = el.querySelector("#signup-server-error");
  const toLoginBtn = el.querySelector("#to-login");

  function validate() {
    let valid = true;
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmError.textContent = "";
    serverError.textContent = "";
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    if (!email) {
      emailError.textContent = "Email is required.";
      valid = false;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      emailError.textContent = "Invalid email address.";
      valid = false;
    }
    if (!password) {
      passwordError.textContent = "Password is required.";
      valid = false;
    } else if (password.length < 8) {
      passwordError.textContent = "Password must be at least 8 characters.";
      valid = false;
    }
    if (password !== confirm) {
      confirmError.textContent = "Passwords do not match.";
      valid = false;
    }
    return valid;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Derive a simple username from the email local-part to satisfy server requirements
      const emailVal = emailInput.value.trim();
      const username = (emailVal.split("@")[0] || "").replace(/[^a-z0-9_-]/gi, "").toLowerCase();

      await api.auth.register({ email: emailVal, password: passwordInput.value, username });

      // Mark signup success in sessionStorage and navigate to login
      try {
        sessionStorage.setItem("signupSuccess", "1");
      } catch (err) {
        // ignore sessionStorage errors
      }
      navigate("/login");
    } catch (err) {
      // Handle specific error messages
      const errorMessage = (err && err.message) || "Signup failed.";

      // Show email-specific errors in the email field
      if (errorMessage.toLowerCase().includes("email")) {
        emailError.textContent = errorMessage;
      }
      // Show username-specific errors as server errors since username is auto-generated
      else if (errorMessage.toLowerCase().includes("username")) {
        serverError.textContent = "Username conflict. Please try a different email address.";
      }
      // Show generic errors in server error area
      else {
        serverError.textContent = errorMessage;
      }
    }
  });

  toLoginBtn.addEventListener("click", () => navigate("/login"));

  return el;
}
