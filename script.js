/* ===================================
   JACVERSE V2 FINAL (NAVIGATION FIX)
   SCRIPT.JS
=================================== */


document.addEventListener("DOMContentLoaded", () => {
    // 1. Loader Logic
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
        }, 300);
    }




    // 2. Auto Highlight Active Bottom Nav Link Based on URL
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".bottom-nav a");
    
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (currentPath.includes(href) && href !== "") {
            navLinks.forEach(item => item.classList.remove("active"));
            link.classList.add("active");
        }
    });
});




// ===========================
// Sidebar Toggle Setup
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
// Dark Mode Setup & Storage
// ===========================
const themeBtn = document.getElementById("themeBtn");




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




// ===========================
// Search Content Filter
// ===========================
const searchInput = document.querySelector(".search-box input");




if (searchInput) {
    searchInput.addEventListener("keyup", function () {
        const value = this.value.toLowerCase();
        // Dynamic dynamic cards ko bhi target karne ke liye yahan selectors check kiye hain
        const cards = document.querySelectorAll(".class-card, .feature-card, #subjectsGrid .card");




        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            if (text.includes(value)) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    });
}




// ===========================
// Intersection Fade Observers
// ===========================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("fade-up");
        }
    });
}, {
    threshold: 0.1
});




document.querySelectorAll(".class-card, .feature-card, .motivation-box").forEach((el) => {
    observer.observe(el);
});




// Manual click fallback for active classes
document.querySelectorAll(".bottom-nav a").forEach(link => {
    link.addEventListener("click", function() {
        document.querySelectorAll(".bottom-nav a").forEach(item => item.classList.remove("active"));
        this.classList.add("active");
    });
});




// ===========================
// Smooth Page Anchors Scroll
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




// Dismiss Drawer Panel
document.querySelectorAll("#sidebar a").forEach(link => {
    link.addEventListener("click", () => {
        if (sidebar && overlay) {
            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        }
    });
});




// Scroll Header State
window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
        document.body.classList.add("scrolled");
    } else {
        document.body.classList.remove("scrolled");
    }
});




// ==========================================
// Dynamic Class/Subject Engine (UPDATED)
// ==========================================
// class.html aur class_2.html dono pages par safely trigger hone ke liye:
if (window.location.pathname.includes("class.html") || window.location.pathname.includes("class_2.html")) {
    const params = new URLSearchParams(window.location.search);
    const classNo = params.get("class");




    if (classNo) {
        const titleEl = document.getElementById("classTitle");
        if (titleEl) titleEl.textContent = `Class ${classNo}`;




        fetch("database.json")
            .then(res => res.json())
            .then(data => {
                const grid = document.getElementById("subjectsGrid");
                const targetKey = `class${classNo}`;
                
                if (grid && data[targetKey]) {
                    const subjects = data[targetKey];
                    grid.innerHTML = "";




                    const iconMap = {
                        "mathematics": "📐",
                        "science": "🔬",
                        "hindi_kshitij": "📖",
                        "hindi_kritika": "📚",
                        "english_beehive": "🎨",
                        "english_first_flight": "🦅",
                        "english_moments": "⌛",
                        "english_footprints": "👣",
                        "social_science_history": "⏳",
                        "social_science_geography": "🌍",
                        "social_science_civics": "⚖️",
                        "social_science_economics": "💰"
                    };




                    for (let key in subjects) {
                        const subjectData = subjects[key];
                        const icon = iconMap[key] || "📘";
                        const engName = key.replace(/_/g, ' ').toUpperCase();
                        
                        grid.innerHTML += `
                            <a href="chapters.html?class=${classNo}&subject=${key}" class="card">
                                <h2><span>${icon}</span> ${engName}</h2>
                                <p>${subjectData.bookName}</p>
                            </a>
                        `;
                    }
                }
            })
            .catch(err => console.error("Database loading error:", err));
    }
}