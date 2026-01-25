document.addEventListener("DOMContentLoaded", () => {
    // Check if the device is likely a mobile/touch device or has a small screen
    const isSmallDevice = window.innerWidth <= 768;
    const isTouchOnly = window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(pointer: fine)").matches;

    if (isSmallDevice || isTouchOnly) {
        return; // Don't initialize trail on small or touch-only devices
    }

    const trailCount = 50; // Number of trail elements
    const trails = [];
    let mouseX = 0, mouseY = 0;

    // Create trail elements
    for (let i = 0; i < trailCount; i++) {
        const trail = document.createElement("div");
        trail.className = "cursor-trail";
        document.body.appendChild(trail);
        trails.push(trail);
    }

    // Update mouse position
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Animate trail
    let index = 0;
    function animate() {
        const trail = trails[index];
        trail.style.left = `${mouseX}px`;
        trail.style.top = `${mouseY}px`;
        trail.style.opacity = 1;

        setTimeout(() => {
            trail.style.opacity = 0;
        }, 200);

        index = (index + 1) % trailCount;
        requestAnimationFrame(animate);
    }
    animate();
});