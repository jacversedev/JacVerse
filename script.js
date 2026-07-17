/* ===================================
   JACVERSE V2 FINAL
   SCRIPT.JS
   PART 1
=================================== */


// ===========================
// Loader
// ===========================


window.addEventListener("load", () => {


    const loader = document.getElementById("loader");


    if (loader) {
        loader.style.opacity = "0";


        setTimeout(() => {
            loader.style.display = "none";
        }, 500);
    }


});


// ===========================
// Sidebar
// ===========================


const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");


if (menuBtn && sidebar && overlay) {


    menuBtn.addEventListener("click", () => {


        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");


    });


    overlay.addEventListener("click", () => {


        sidebar.classList.remove("active");
        overlay.classList.remove("active");


    });


}


// ===========================
// Dark Mode
// ===========================


const themeBtn = document.getElementById("themeBtn");


if (themeBtn) {


    themeBtn.addEventListener("click", () => {


        document.body.classList.toggle("dark");


        const icon = themeBtn.querySelector("i");


        if (document.body.classList.contains("dark")) {


            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");


        } else {


            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");


        }


    });


}
/* ===================================
   JACVERSE V2 FINAL
   SCRIPT.JS
   PART 2
=================================== */


// ===========================
// Search
// ===========================


const searchInput = document.querySelector(".search-box input");


if (searchInput) {


    searchInput.addEventListener("keyup", function () {


        const value = this.value.toLowerCase();


        const cards = document.querySelectorAll(".class-card, .feature-card");


        cards.forEach(card => {


            const text = card.innerText.toLowerCase();


            if (text.includes(value)) {


                card.style.display = "block";


            } else {


                card.style.display = "none";


            }


        });


    });


}


// ===========================
// Fade Animation
// ===========================


const observer = new IntersectionObserver((entries) => {


    entries.forEach(entry => {


        if (entry.isIntersecting) {


            entry.target.classList.add("fade-up");


        }


    });


}, {


    threshold: 0.2


});


document.querySelectorAll(".class-card, .feature-card, .motivation-box").forEach((el) => {


    observer.observe(el);


});


// ===========================
// Active Bottom Navigation
// ===========================


const navLinks = document.querySelectorAll(".bottom-nav a");


navLinks.forEach(link => {


    link.addEventListener("click", () => {


        navLinks.forEach(item => item.classList.remove("active"));


        link.classList.add("active");


    });


});
/* ===================================
   JACVERSE V2 FINAL
   SCRIPT.JS
   PART 3
=================================== */


// ===========================
// Smooth Scroll
// ===========================


document.querySelectorAll('a[href^="#"]').forEach(anchor => {


    anchor.addEventListener("click", function (e) {


        const target = document.querySelector(this.getAttribute("href"));


        if (target) {


            e.preventDefault();


            target.scrollIntoView({


                behavior: "smooth"


            });


        }


    });


});


// ===========================
// Close Sidebar After Click
// ===========================


document.querySelectorAll("#sidebar a").forEach(link => {


    link.addEventListener("click", () => {


        sidebar.classList.remove("active");
        overlay.classList.remove("active");


    });


});


// ===========================
// Save Dark Mode
// ===========================


if (localStorage.getItem("theme") === "dark") {


    document.body.classList.add("dark");


    const icon = document.querySelector("#themeBtn i");


    if (icon) {


        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");


    }


}


if (themeBtn) {


    themeBtn.addEventListener("click", () => {


        if (document.body.classList.contains("dark")) {


            localStorage.setItem("theme", "dark");


        } else {


            localStorage.setItem("theme", "light");


        }


    });


}


// ===========================
// Scroll To Top
// ===========================


window.addEventListener("scroll", () => {


    if (window.scrollY > 200) {


        document.body.classList.add("scrolled");


    } else {


        document.body.classList.remove("scrolled");


    }


});


// ===========================
// Console Message
// ===========================


console.log("%c🚀 JacVerse V2 Loaded Successfully!",
"color:#2563eb;font-size:18px;font-weight:bold;");