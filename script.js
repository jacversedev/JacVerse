/* ===================================
   JACVERSE V2
   script.js
=================================== */


document.addEventListener("DOMContentLoaded", () => {


    /* ==========================
       Loader
    ========================== */


    const loader = document.querySelector(".loader");


    window.addEventListener("load", () => {
        setTimeout(() => {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
        }, 700);
    });


    /* ==========================
       Sidebar
    ========================== */


    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");


    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    });


    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });


    /* ==========================
       Dark Mode
    ========================== */


    const themeBtn = document.getElementById("themeBtn");


    function updateThemeIcon() {


        const icon = themeBtn.querySelector("i");


        if (document.body.classList.contains("dark")) {
            icon.className = "fas fa-sun";
        } else {
            icon.className = "fas fa-moon";
        }


    }


    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }


    updateThemeIcon();


    themeBtn.addEventListener("click", () => {


        document.body.classList.toggle("dark");


        if (document.body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }


        updateThemeIcon();


    });


    /* ==========================
       Smooth Fade Animation
    ========================== */


    const observer = new IntersectionObserver((entries) => {


        entries.forEach(entry => {


            if (entry.isIntersecting) {
                entry.target.classList.add("fade-up");
            }


        });


    }, {
        threshold: 0.15
    });


    document.querySelectorAll(
        ".stat-card, .class-card, .feature-card, .motivation-box"
    ).forEach(item => {


        observer.observe(item);


    });


    /* ==========================
       Active Bottom Navigation
    ========================== */


    const navLinks = document.querySelectorAll(".bottom-nav a");


    navLinks.forEach(link => {


        link.addEventListener("click", () => {


            navLinks.forEach(nav => nav.classList.remove("active"));


            link.classList.add("active");


        });


    });


    /* ==========================
       Search Box
    ========================== */


    const searchInput = document.querySelector(".search-box input");


    if (searchInput) {


        searchInput.addEventListener("keypress", function(e) {


            if (e.key === "Enter") {


                const value = this.value.trim();


                if (value !== "") {


                    alert("Searching for: " + value);


                }


            }


        });


    }


});