import api from "../api.js";

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

    try {
      await api.auth.login({ email, password });
      // On success navigate to feed
      location.hash = "#/feed";
    } catch (err) {
      // Minimal inline error handling
      // eslint-disable-next-line no-console
      console.error("Login failed", err);
      alert((err && err.message) || "Login failed");
    }
  });

  return el;
}
