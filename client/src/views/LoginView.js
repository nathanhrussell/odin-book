import api from "../api.js";
import { navigate } from "../router.js";

export function LoginView() {
  const el = document.createElement("main");
  el.className = "mx-auto max-w-md px-4 py-8";

  el.innerHTML = `
    <section class="card card-pad">
      <h2 class="text-lg font-semibold">Sign in</h2>
      <form id="login-form" class="flex flex-col gap-3 mt-4">
        <input name="email" type="email" placeholder="Email" class="input" required />
        <input name="password" type="password" placeholder="Password" class="input" required />
        <div class="flex justify-end">
          <button class="btn btn-primary" type="submit">Sign in</button>
        </div>
      </form>
    </section>
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
