import api from "../api.js";
import { navigate } from "../router.js";

export function LoginView() {
  const el = document.createElement("main");
  // Full-viewport brand background, center content
  // make background cover entire viewport width while keeping content centered
  el.className = "min-h-screen w-full flex items-center justify-center";

  // Set the body background color to #400c94 for full viewport coverage
  document.body.style.backgroundColor = "#6B4CAD";
  // Check for signup success (from navigation)
  let signupSuccess = false;
  try {
    const url = new URL(window.location.href);
    if (url.hash.includes("signupSuccess")) {
      signupSuccess = true;
      // Remove the flag from the hash for cleanliness
      url.hash = url.hash.replace("signupSuccess", "");
      window.history.replaceState({}, document.title, url.toString());
    }
  } catch {}

  el.innerHTML = `
    <div class="w-full max-w-xl px-4 py-24">
      <div class="text-center mb-12">
        <img src="/odinbooklogovector.svg" alt="Odin Book" class="mx-auto w-72 h-72 rounded-lg mb-8" />
        <p class="text-2xl font-semibold text-gray-100 mt-2">Connect. Share. Interact.</p>
      </div>
      <section class="card card-pad shadow-none border-none" style="background-color: #6B4CAD; border: none;">
        ${
          signupSuccess
            ? '<div class="mb-4 text-green-400 font-semibold text-center">Sign up successful! Please sign in.</div>'
            : ""
        }
        <form id="login-form" class="flex flex-col gap-6 mt-6">
          <label for="email" class="sr-only">Email</label>
          <input id="email" name="email" type="email" placeholder="Email" class="input text-lg py-4" required autocomplete="email" autofocus />
          <label for="password" class="sr-only">Password</label>
          <input id="password" name="password" type="password" placeholder="Password" class="input text-lg py-4" required autocomplete="current-password" />
          <div class="flex justify-center mt-10">
            <button class="btn btn-on-brand px-12 py-4 text-xl font-semibold" type="submit">Sign In</button>
          </div>
        </form>
        <div class="text-center mt-10 flex flex-col items-center gap-2">
          <span class="text-gray-100">Don't have an account?</span>
          <button id="to-signup" class="btn btn-on-brand px-6 py-2 text-base font-semibold" style="min-width: 0; width: auto;">Sign Up</button>
        </div>
      </section>
    </div>
  `;
  // Add event listener for signup navigation
  setTimeout(() => {
    const signupBtn = el.querySelector("#to-signup");
    if (signupBtn) {
      signupBtn.addEventListener("click", () => navigate("/signup"));
    }
  }, 0);

  const form = el.querySelector("#login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const email = data.get("email");
    const password = data.get("password");

    // Inline error box
    let errBox = el.querySelector("#login-error");
    if (!errBox) {
      errBox = document.createElement("div");
      errBox.id = "login-error";
      errBox.className = "text-sm text-red-500 text-center mt-2";
      form.prepend(errBox);
    }
    errBox.textContent = "";

    try {
      await api.auth.login({ email, password });
      // On success navigate to feed
      navigate("/feed");
    } catch (err) {
      // Show error inline, not as alert
      errBox.textContent = (err && err.message) || "Login failed";
    }
  });

  return el;
}
