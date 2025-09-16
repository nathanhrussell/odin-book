// showConfirm(message) -> Promise<boolean>
export function showConfirm(message, options = {}) {
  return new Promise((resolve) => {
    try {
      const overlay = document.createElement("div");
      overlay.className = "fixed inset-0 bg-black/40 flex items-center justify-center z-60";

      const panel = document.createElement("div");
      panel.className =
        "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-6 w-[min(480px,90vw)] shadow-xl";

      const msg = document.createElement("div");
      msg.className = "mb-4 text-sm leading-6";
      msg.textContent = message || "Are you sure?";

      const actions = document.createElement("div");
      actions.className = "flex justify-end gap-3";

      const cancel = document.createElement("button");
      cancel.className = "btn btn-ghost";
      cancel.textContent = options.cancelText || "Cancel";

      const confirm = document.createElement("button");
      confirm.className = "btn btn-primary";
      confirm.textContent = options.confirmText || "Delete";

      actions.appendChild(cancel);
      actions.appendChild(confirm);
      panel.appendChild(msg);
      panel.appendChild(actions);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);

      function cleanup() {
        try {
          overlay.remove();
        } catch (e) {
          // ignore
        }
      }

      cancel.addEventListener("click", () => {
        cleanup();
        resolve(false);
      });
      confirm.addEventListener("click", () => {
        cleanup();
        resolve(true);
      });

      // allow escape key to cancel
      function onKey(e) {
        if (e.key === "Escape") {
          cleanup();
          resolve(false);
          window.removeEventListener("keydown", onKey);
        }
      }
      window.addEventListener("keydown", onKey);
    } catch (err) {
      // Fallback to built-in confirm if something goes wrong
      // eslint-disable-next-line no-alert
      const ok = window.confirm(message || "Are you sure?");
      resolve(Boolean(ok));
    }
  });
}
