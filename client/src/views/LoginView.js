import api from "../api.js";
import { navigate } from "../router.js";

export function LoginView() {
  const el = document.createElement("main");
  // Full-viewport brand background, center content
  // make background cover entire viewport width while keeping content centered
  el.className = "min-h-screen w-full flex items-center justify-center";

  // Set the body background color to #400c94 for full viewport coverage
  document.body.style.backgroundColor = "#6B4CAD";
  el.innerHTML = `
    <div class="w-full max-w-xl px-4 py-24">
      <div class="text-center mb-12">
        <img src="/odinbooklogovector.svg" alt="Odin Book" class="mx-auto w-72 h-72 rounded-lg mb-8" />
        <p class="text-2xl font-semibold text-gray-100 mt-2">Connect. Share. Interact.</p>
      </div>
  <section class="card card-pad shadow-none border-none" style="background-color: #6B4CAD; border: none;">
        <form id="login-form" class="flex flex-col gap-6 mt-6">
          <label for="email" class="sr-only">Email</label>
          <input id="email" name="email" type="email" placeholder="Email" class="input text-lg py-4" required autocomplete="email" autofocus />
          <label for="password" class="sr-only">Password</label>
          <input id="password" name="password" type="password" placeholder="Password" class="input text-lg py-4" required autocomplete="current-password" />
          <div class="flex justify-center mt-10">
            <button class="btn btn-on-brand px-12 py-4 text-xl font-semibold" type="submit">Sign In</button>
          </div>
        </form>
      </section>
    </div>
  `;

  const form = el.querySelector("#login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const email = data.get("email");
    const password = data.get("password");

    const errBoxId = "login-error";
    let errBox = el.querySelector(`#${errBoxId}`);
    if (!errBox) {
      errBox = document.createElement("div");
      errBox.id = errBoxId;
      errBox.className = "text-sm text-red-500";
      form.prepend(errBox);
    }

    try {
      await api.auth.login({ email, password });
      // On success navigate to feed
      navigate("/feed");
    } catch (err) {
      // Minimal inline error handling
      // eslint-disable-next-line no-console
      console.error("Login failed", err);
      errBox.textContent = (err && err.message) || "Login failed";
    }
  });

  return el;
}
