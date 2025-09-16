export function showToast(message, timeout = 2400) {
  try {
    const t = document.createElement("div");
    t.className = "fixed right-4 top-4 bg-black/80 text-white px-4 py-2 rounded shadow-lg z-50";
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), timeout);
  } catch (e) {
    // ignore
  }
}
