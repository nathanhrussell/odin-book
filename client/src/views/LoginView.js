import api from "../api.js";
import { navigate } from "../router.js";

export function LoginView() {
  const el = document.createElement("main");
  // Full-viewport brand background, center content
  el.className = "min-h-screen flex items-center justify-center bg-[var(--brand-bg)]";
  el.innerHTML = `
    <div class="w-full max-w-md px-4 py-12">
      <div class="text-center mb-6">
        <img src="/odinbooklogo.png" alt="Odin Book" class="mx-auto w-28 h-28 rounded-md mb-4" />
        <p class="text-sm text-gray-100 mt-1">Connect. Share. Interact.</p>
      </div>
      <section class="card card-pad card-on-brand">
      <h2 class="text-lg font-semibold">Sign in</h2>
      <form id="login-form" class="flex flex-col gap-4 mt-6">
        <label for="email" class="sr-only">Email</label>
        <input id="email" name="email" type="email" placeholder="Email" class="input" required autocomplete="email" autofocus />
        <label for="password" class="sr-only">Password</label>
        <input id="password" name="password" type="password" placeholder="Password" class="input" required autocomplete="current-password" />
        <div class="flex justify-center mt-8">
          <button class="btn btn-on-brand px-8 py-3 text-base" type="submit">Sign in</button>
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
