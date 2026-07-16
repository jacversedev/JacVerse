/**
 * ==========================================================================
 * JACVERSE CORE FUNCTIONAL RUNTIME ENGINE V2.5
 * Performance Polish • Typewriter Mechanics • Theme Management
 * ==========================================================================
 */


document.addEventListener("DOMContentLoaded", () => {
    
    // 1. High-Tier Micro Engine Loader Control
    const loader = document.getElementById("pageLoader");
    if (loader) {
        window.addEventListener("load", () => {
            loader.style.opacity = "0";
            loader.style.transition = "opacity 0.4s ease";
            setTimeout(() => {
                loader.style.display = "none";
            }, 400);
        });
        
        // Safety timeout in case window load event already fired
        setTimeout(() => {
            loader.style.display = "none";
        }, 2000);
    }


    // 2. Responsive Sidebar Logic Engine
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const sidebarLinks = document.querySelectorAll("#sidebar ul li a");


    const toggleSidebar = () => {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    };


    if (menuBtn && sidebar && overlay) {
        menuBtn.addEventListener("click", toggleSidebar);
        overlay.addEventListener("click", toggleSidebar);
        
        sidebarLinks.forEach(link => {
            link.addEventListener("click", () => {
                sidebar.classList.remove("active");
                overlay.classList.remove("active");
            });
        });
    }


    // 3. Luxurious Typewriter Typing Sync Module
    const typewriterElement = document.getElementById("typewriter");
    if (typewriterElement) {
        const wordsArray = ["Knowledge.", "Notes.", "MCQs.", "Success."];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;


        function typeLoop() {
            const currentWord = wordsArray[wordIndex];
            
            if (isDeleting) {
                typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50; // Faster deleting speed
            } else {
                typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 120; // Steady organic typing speed
            }


            if (!isDeleting && charIndex === currentWord.length) {
                typingSpeed = 2000; // Standstill delay at completion
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % wordsArray.length;
                typingSpeed = 400; // Inter-word change transition buffer
            }


            setTimeout(typeLoop, typingSpeed);
        }
        // Initiate the typewriter sequence
        typeLoop();
    }


    // 4. Unified Native Dark Engine Theme Management
    const themeBtn = document.getElementById("themeBtn");
    const body = document.body;


    // Check Local Storage caching for pre-existing UX preference
    if (localStorage.getItem("jacverse-theme") === "dark") {
        body.classList.add("dark");
        if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }


    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            body.classList.toggle("dark");
            const isDark = body.classList.contains("dark");
            
            // Caching user system profile configuration state
            localStorage.setItem("jacverse-theme", isDark ? "dark" : "light");
            
            // Icon Mutation Mechanics
            themeBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
            
            // Kinetic rotation animation response hook
            themeBtn.style.transform = "rotate(360deg)";
            setTimeout(() => { themeBtn.style.transform = ""; }, 400);
        });
    }


    // 5. Tactile Bottom Hub Active State Switching (Application-Mode Interactivity)
    const bottomNavLinks = document.querySelectorAll(".bottom-nav a");
    bottomNavLinks.forEach(link => {
        link.addEventListener("click", function() {
            bottomNavLinks.forEach(item => item.classList.remove("active"));
            this.classList.add("active");
        });
    });
});