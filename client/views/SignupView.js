import api from "../src/api.js";
import { navigate } from "../src/router.js";

export function SignupView() {
  const el = document.createElement("main");
  el.className = "min-h-screen w-full flex items-center justify-center bg-gray-50";
  el.innerHTML = `
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
      <h2 class="text-2xl font-bold text-center">Sign Up</h2>
      <form id="signup-form" class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Email</label>
          <input type="email" id="signup-email" class="w-full px-3 py-2 border rounded" required />
          <div id="signup-email-error" class="text-sm text-red-600"></div>
        </div>
        <div>
          <label class="block mb-1 font-medium">Password</label>
          <input type="password" id="signup-password" class="w-full px-3 py-2 border rounded" required />
          <div id="signup-password-error" class="text-sm text-red-600"></div>
        </div>
        <div>
          <label class="block mb-1 font-medium">Confirm Password</label>
          <input type="password" id="signup-confirm-password" class="w-full px-3 py-2 border rounded" required />
          <div id="signup-confirm-password-error" class="text-sm text-red-600"></div>
        </div>
        <div id="signup-server-error" class="text-sm text-red-600"></div>
        <button type="submit" class="w-full py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700">Sign Up</button>
      </form>
      <div class="text-center mt-4">
        <span>Already have an account? </span>
        <button class="text-blue-600 hover:underline" id="to-login">Sign In</button>
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
      await api.auth.register({ email: emailInput.value.trim(), password: passwordInput.value });
      // Redirect to login with a hash to indicate signup success
      window.location.hash = "#/login#signupSuccess";
      window.location.reload();
    } catch (err) {
      serverError.textContent = (err && err.message) || "Signup failed.";
    }
  });

  toLoginBtn.addEventListener("click", () => navigate("/login"));

  return el;
}
