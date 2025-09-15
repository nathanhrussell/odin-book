export function LoadingNode(message = "Loading...") {
  const el = document.createElement("div");
  el.className = "text-center p-6 text-gray-500";
  el.textContent = message;
  return el;
}

export function EmptyNode(message = "No items") {
  const el = document.createElement("div");
  el.className = "text-center p-6 text-gray-500";
  el.textContent = message;
  return el;
}

export function ErrorNode(message = "Something went wrong") {
  const el = document.createElement("div");
  el.className = "text-center p-6 text-red-500";
  el.textContent = message;
  return el;
}
