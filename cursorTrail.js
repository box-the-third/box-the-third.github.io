document.addEventListener("DOMContentLoaded", () => {
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