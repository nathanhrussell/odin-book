export function setupCounter(element) {
  let counter = 0;
  const el = element; // local alias

  const setCounter = (count) => {
    counter = count;
    el.innerHTML = `count is ${counter}`;
  };

  el.addEventListener("click", () => setCounter(counter + 1));
  setCounter(0);
}
