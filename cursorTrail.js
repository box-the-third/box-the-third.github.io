document.addEventListener("DOMContentLoaded", () => {
    const isSmallDevice = window.innerWidth <= 768;
    const trailCount = 50; 
    const trails = [];
    const mainCursor = document.querySelector(".cursor");
    let mouseX = 0, mouseY = 0;

    // Create trail elements
    for (let i = 0; i < trailCount; i++) {
        const trail = document.createElement("div");
        trail.className = "cursor-trail";
        document.body.appendChild(trail);
        trails.push(trail);
    }

    // Update position
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if(mainCursor) {
            mainCursor.style.left = `${mouseX}px`;
            mainCursor.style.top = `${mouseY}px`;
        }
    });

    // --- MOBILE LOGIC ---
    // If it's a small screen, hide/show cursor based on card proximity
    if (isSmallDevice) {
        const cards = document.querySelectorAll('.service-card, .card');
        
        cards.forEach(card => {
            // When touching/hovering a card, show the cursor
            card.addEventListener("mouseenter", () => {
                mainCursor?.classList.add("mobile-active");
                trails.forEach(t => t.classList.add("mobile-active"));
            });

            // When leaving the card, hide it again
            card.addEventListener("mouseleave", () => {
                mainCursor?.classList.remove("mobile-active");
                trails.forEach(t => t.classList.remove("mobile-active"));
            });
        });
    }

    // Animation loop (remains the same)
    let index = 0;
    function animate() {
        const trail = trails[index];
        trail.style.left = `${mouseX}px`;
        trail.style.top = `${mouseY}px`;
        
        // Only trigger opacity logic if not blocked by CSS
        trail.style.opacity = 1;

        setTimeout(() => {
            trail.style.opacity = 0;
        }, 200);

        index = (index + 1) % trailCount;
        requestAnimationFrame(animate);
    }
    animate();
});