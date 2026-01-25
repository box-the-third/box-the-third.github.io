const cursor = document.querySelector(".cursor");

if (cursor) {
  const isSmallDevice = window.innerWidth <= 768;
  const isTouchOnly = window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(pointer: fine)").matches;

  if (!isSmallDevice && !isTouchOnly) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
  }
}