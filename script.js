/* ===================================
   JACVERSE V2 FINAL (FAST LOAD FIX)
   SCRIPT.JS
   PART 1
=================================== */


// ===========================
// Loader (Instant Load Fix)
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
        }, 300); // Fast fade out
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
// Dark Mode Toggle & Save
// ===========================
const themeBtn = document.getElementById("themeBtn");


// Page load par local storage check karna
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
        document.body.classList.toggle("dark");
        const icon = themeBtn.querySelector("i");


        if (document.body.classList.contains("dark")) {
            if (icon) {
                icon.classList.remove("fa-moon");
                icon.classList.add("fa-sun");
            }
            localStorage.setItem("theme", "dark");
        } else {
            if (icon) {
                icon.classList.remove("fa-sun");
                icon.classList.add("fa-moon");
            }
            localStorage.setItem("theme", "light");
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
        if (sidebar && overlay) {
            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        }
    });
});


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
// Dynamic Class Page
// ===========================
if (window.location.pathname.includes("class.html")) {
    const params = new URLSearchParams(window.location.search);
    const classNo = params.get("class");


    if (classNo) {
        fetch("database.json")
            .then(res => res.json())
            .then(data => {
                const titleEl = document.getElementById("classTitle");
                if (titleEl) titleEl.textContent = `Class ${classNo}`;


                const grid = document.getElementById("subjectsGrid");
                if (grid && data[`class${classNo}`]) {
                    const subjects = data[`class${classNo}`].subjects;
                    grid.innerHTML = "";


                    for (let key in subjects) {
                        grid.innerHTML += `
                            <a href="#" class="card">
                                <h2>${subjects[key].icon} ${subjects[key].name}</h2>
                                <p>${subjects[key].hindi}</p>
                            </a>
                        `;
                    }
                }
            })
            .catch(err => console.error("Error loading database:", err));
    }
}


// Console Message
console.log("%c🚀 JacVerse V2 Loaded Successfully with Navigation Fix!", "color:#2563eb;font-size:18px;font-weight:bold;");