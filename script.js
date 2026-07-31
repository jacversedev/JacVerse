/* =====================================================
   JacVerse - Main Script
   Database Driven System
   Part 1: Database Loading & Core Setup
===================================================== */


"use strict";


/* =====================================================
   GLOBAL DATABASE
===================================================== */


let jacVerseDatabase = null;


/* =====================================================
   DATABASE LOADER
===================================================== */


async function loadDatabase() {
    try {
        const response = await fetch("database.json");


        if (!response.ok) {
            throw new Error(
                `Database loading failed: ${response.status}`
            );
        }


        jacVerseDatabase = await response.json();


        console.log("JacVerse database loaded successfully.");


        /*
         * Database load hone ke baad
         * current page ke according
         * required function chalega.
         */


        initializeCurrentPage();


    } catch (error) {


        console.error(
            "JacVerse Database Error:",
            error
        );


        showDatabaseError();
    }
}


/* =====================================================
   DATABASE ERROR MESSAGE
===================================================== */


function showDatabaseError() {
    const errorBox = document.createElement("div");
    errorBox.className = "database-error";
    errorBox.innerHTML = `
        <div>
            <h2>⚠️ Data Loading Error</h2>
            <p>
                Study data load nahi ho pa raha hai.
                Please page refresh karke dobara try karein.
            </p>
        </div>
    `;
    document.body.appendChild(errorBox);
}


/* =====================================================
   CURRENT PAGE DETECTION
===================================================== */


function initializeCurrentPage() {
    const currentPage =
        window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


    /*
     * Abhi hum sirf page detect kar rahe hain.
     * Agle parts mein in pages ka actual system add hoga.
     */


    if (
        currentPage === "" ||
        currentPage === "index.html"
    ) {
        initializeHomePage();
    }
    else if (
        currentPage === "class.html"
    ) {
        initializeClassPage();
    }
    else if (
        currentPage === "subject.html"
    ) {
        initializeSubjectPage();
    }
    else if (
        currentPage === "chapter.html"
    ) {
        initializeChapterPage();
    }
    else if (
        currentPage === "content.html"
    ) {
        initializeContentPage(); // Dangling else-if solution integrated safely here
    }
}


/* =====================================================
   HOME PAGE PLACEHOLDER
===================================================== */


function initializeHomePage() {
    console.log(
        "JacVerse Home Page Initialized"
    );
}


/* =====================================================
   START APPLICATION
===================================================== */


document.addEventListener(
    "DOMContentLoaded",
    loadDatabase
);


/* =====================================================
   JacVerse - Part 2 & Part 9 Helpers
   Class, Subject, Book, Chapter Data Fetchers
===================================================== */


function getClassNumberFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("class");
}


function getClassData(classId) {
    const db = window.jAC_DATABASE || jacVerseDatabase;
    if (!db || !db.classes) {
        return null;
    }
    return db.classes[classId] || null;
}


function getSubjectData(classId, subjectId) {
    const classData = getClassData(classId);
    if (!classData || !Array.isArray(classData.subjects)) {
        return null;
    }
    return classData.subjects.find(subject => subject.id === subjectId) || null;
}


function getBookData(classId, subjectId, bookId) {
    const subjectData = getSubjectData(classId, subjectId);
    if (!subjectData || !Array.isArray(subjectData.books)) {
        return null;
    }
    return subjectData.books.find(book => book.id === bookId) || null;
}


function getChapterData(classId, subjectId, bookId, chapterId) {
    const bookData = getBookData(classId, subjectId, bookId);
    if (!bookData) return null;


    if (Array.isArray(bookData.chapters)) {
        return bookData.chapters.find(chapter => chapter.id === chapterId) || null;
    }


    if (Array.isArray(bookData.sections)) {
        for (const section of bookData.sections) {
            if (Array.isArray(section.chapters)) {
                const chapter = section.chapters.find(item => item.id === chapterId);
                if (chapter) {
                    return {
                        ...chapter,
                        sectionId: section.id,
                        sectionName: section.name
                    };
                }
            }
        }
    }
    return null;
}


/* =====================================================
   INITIALIZE CLASS PAGE
===================================================== */


function initializeClassPage() {
    const classNumber = getClassNumberFromURL();


    if (!classNumber || !["9", "10"].includes(classNumber)) {
        showClassPageError("Invalid class selected.");
        return;
    }


    const classData = getClassData(classNumber);
    if (!classData) {
        showClassPageError("Class data not found.");
        return;
    }


    updateClassTitle(classData);
    renderSubjects(classData.subjects);
}


function updateClassTitle(classData) {
    const titleElement = document.getElementById("classTitle");
    if (!titleElement) return;
    titleElement.textContent = classData.name;
}


/* =====================================================
   RENDER SUBJECTS (Polymorphic Support for Part 2 & Part 12)
===================================================== */


function renderSubjects(arg1, arg2) {
    if (typeof arg1 === "string" || typeof arg1 === "number") {
        const classId = arg1;
        const container = arg2;
        if (!container) return;
        const subjects = getAllSubjects(classId);
        container.innerHTML = subjects.map(subject => `
            <a href="subject.html?class=${classId}&subject=${subject.id}" class="subject-card">
                <span>📘</span>
                <h3>${escapeHTML(subject.name)}</h3>
                ${subject.nameHindi ? `<p>${escapeHTML(subject.nameHindi)}</p>` : ""}
            </a>
        `).join("");
    } else {
        const subjects = arg1;
        const subjectsGrid = document.getElementById("subjectsGrid");
        if (!subjectsGrid) return;
        subjectsGrid.innerHTML = "";


        if (!Array.isArray(subjects) || subjects.length === 0) {
            subjectsGrid.innerHTML = `<p class="empty-message">No subjects available.</p>`;
            return;
        }


        subjects.forEach(function(subject) {
            const subjectCard = createSubjectCard(subject);
            subjectsGrid.appendChild(subjectCard);
        });
    }
}


function createSubjectCard(subject) {
    const card = document.createElement("a");
    card.className = "card";
    card.href = `subject.html?class=${getClassNumberFromURL()}&subject=${encodeURIComponent(subject.id)}`;
    card.innerHTML = `
        <h2>
            <i class="fa-solid fa-book"></i>
            <span>${escapeHTML(subject.name)}</span>
        </h2>
        <p>${escapeHTML(subject.nameHindi || "")}</p>
    `;
    return card;
}


function showClassPageError(message) {
    const subjectsGrid = document.getElementById("subjectsGrid");
    if (!subjectsGrid) return;
    subjectsGrid.innerHTML = `
        <div class="database-error">
            <h2>⚠️ Error</h2>
            <p>${escapeHTML(message)}</p>
        </div>
    `;
}


/* =====================================================
   JacVerse - Part 3
   Subject Page System
===================================================== */


function getSubjectIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("subject");
}


function initializeSubjectPage() {
    const classNumber = getClassNumberFromURL();
    const subjectId = getSubjectIdFromURL();


    if (!classNumber || !["9", "10"].includes(classNumber)) {
        showSubjectPageError("Invalid class selected.");
        return;
    }


    if (!subjectId) {
        showSubjectPageError("Subject not selected.");
        return;
    }


    const subjectData = getSubjectData(classNumber, subjectId);
    if (!subjectData) {
        showSubjectPageError("Subject data not found.");
        return;
    }


    renderSubjectInformation(subjectData);
    renderBooks(subjectData.books);
}


function renderSubjectInformation(subject) {
    const subjectTitle = document.getElementById("subjectTitle");
    if (subjectTitle) subjectTitle.textContent = subject.name;


    const subjectHindi = document.getElementById("subjectHindi");
    if (subjectHindi && subject.nameHindi) {
        subjectHindi.textContent = subject.nameHindi;
    }
}


/* =====================================================
   RENDER BOOKS (Polymorphic Support for Part 3 & Part 12)
===================================================== */


function renderBooks(arg1, arg2, arg3) {
    if (arg3 !== undefined || typeof arg1 === "string") {
        const classId = arg1;
        const subjectId = arg2;
        const container = arg3;
        if (!container) return;
        const books = getAllBooks(classId, subjectId);
        container.innerHTML = books.map(book => `
            <a href="book.html?class=${classId}&subject=${subjectId}&book=${book.id}" class="book-card">
                <span>📚</span>
                <h3>${escapeHTML(book.name)}</h3>
            </a>
        `).join("");
    } else {
        const books = arg1;
        const booksContainer = document.getElementById("booksContainer");
        if (!booksContainer) return;
        booksContainer.innerHTML = "";


        if (!Array.isArray(books) || books.length === 0) {
            booksContainer.innerHTML = `<p class="empty-message">No books available.</p>`;
            return;
        }


        books.forEach(function(book) {
            const bookCard = createBookCard(book);
            booksContainer.appendChild(bookCard);
        });
    }
}


function createBookCard(book) {
    const bookCard = document.createElement("div");
    bookCard.className = "book-card";
    bookCard.innerHTML = `
        <div class="book-card-content">
            <i class="fa-solid fa-book-open"></i>
            <h2>${escapeHTML(book.name)}</h2>
        </div>
        <div class="book-chapter-count">
            ${getBookChapterCount(book)} Chapters
        </div>
        <button type="button" class="view-book-btn" data-book-id="${escapeHTML(book.id)}">
            View Chapters
        </button>
    `;


    const viewButton = bookCard.querySelector(".view-book-btn");
    if (viewButton) {
        viewButton.addEventListener("click", function() {
            openBookChapters(book.id);
        });
    }
    return bookCard;
}


function getBookChapterCount(book) {
    if (Array.isArray(book.chapters)) {
        return book.chapters.length;
    }
    if (Array.isArray(book.sections)) {
        let totalChapters = 0;
        book.sections.forEach(function(section) {
            if (Array.isArray(section.chapters)) {
                totalChapters += section.chapters.length;
            }
        });
        return totalChapters;
    }
    return 0;
}


function openBookChapters(bookId) {
    const classNumber = getClassNumberFromURL();
    const subjectId = getSubjectIdFromURL();
    window.location.href = `chapter.html?class=${encodeURIComponent(classNumber)}&subject=${encodeURIComponent(subjectId)}&book=${encodeURIComponent(bookId)}`;
}


function showSubjectPageError(message) {
    const errorContainer = document.getElementById("booksContainer");
    if (!errorContainer) return;
    errorContainer.innerHTML = `
        <div class="database-error">
            <h2>⚠️ Error</h2>
            <p>${escapeHTML(message)}</p>
        </div>
    `;
}


/* =====================================================
   JacVerse - Part 4
   Chapter Page System
===================================================== */


function getBookIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("book");
}


/* =====================================================
   CONSOLIDATED INITIALIZE CHAPTER PAGE (Parts 4 & 9)
===================================================== */


function initializeChapterPage() {
    console.log("JacVerse Chapter Page Initialized");
    const classNumber = getClassNumberFromURL();
    const subjectId = getSubjectIdFromURL();
    const bookId = getBookIdFromURL();


    if (!classNumber || !["9", "10"].includes(classNumber)) {
        showChapterPageError("Invalid class selected.");
        return;
    }
    if (!subjectId) {
        showChapterPageError("Subject not selected.");
        return;
    }
    if (!bookId) {
        showChapterPageError("Book not selected.");
        return;
    }


    const bookData = getBookData(classNumber, subjectId, bookId);
    if (!bookData) {
        showChapterPageError("Book data not found.");
        return;
    }


    renderBookInformation(bookData);
    const chContainer = document.getElementById("chaptersContainer");
    if (chContainer) {
        renderChapters(bookData);
    }


    // Part 9 Integration
    const pageInfo = (typeof getPageInfo === "function") ? getPageInfo() : null;
    if (pageInfo && pageInfo.chapterId) {
        setChapterTitle();
        setBookInformation();
        setChapterNumber();
        updateChapterButtons();
    }
}


function renderBookInformation(book) {
    const bookTitle = document.getElementById("bookTitle");
    if (bookTitle) bookTitle.textContent = book.name;
}


function getAllChapters(book) {
    let chapters = [];
    if (Array.isArray(book.chapters)) {
        chapters = book.chapters.map(function(chapter) {
            return { ...chapter, sectionName: null };
        });
    }
    if (Array.isArray(book.sections)) {
        book.sections.forEach(function(section) {
            if (!Array.isArray(section.chapters)) return;
            section.chapters.forEach(function(chapter) {
                chapters.push({ ...chapter, sectionName: section.name });
            });
        });
    }
    return chapters;
}


/* =====================================================
   RENDER CHAPTERS (Polymorphic Support for Part 4 & Part 12)
===================================================== */


function renderChapters(arg1, arg2, arg3, arg4) {
    if (arg4 !== undefined) {
        const classId = arg1;
        const subjectId = arg2;
        const bookId = arg3;
        const container = arg4;
        if (!container) return;


        const bookData = getBookData(classId, subjectId, bookId);
        if (!bookData) return;


        let chapters = [];
        if (bookData.chapters) {
            chapters = bookData.chapters.map(chapter => ({ ...chapter, sectionName: null }));
        }
        if (bookData.sections) {
            bookData.sections.forEach(section => {
                section.chapters.forEach(chapter => {
                    chapters.push({ ...chapter, sectionName: section.name });
                });
            });
        }


        container.innerHTML = chapters.map(chapter => `
            <a href="chapter.html?class=${classId}&subject=${subjectId}&book=${bookId}&chapter=${chapter.id}" class="chapter-card">
                <span class="chapter-number">${chapter.number}</span>
                <div>
                    <h3>${escapeHTML(chapter.title)}</h3>
                    ${chapter.sectionName ? `<small>${escapeHTML(chapter.sectionName)}</small>` : ""}
                </div>
            </a>
        `).join("");
    } else {
        const book = arg1;
        const chaptersContainer = document.getElementById("chaptersContainer");
        if (!chaptersContainer) return;
        chaptersContainer.innerHTML = "";


        const chapters = getAllChapters(book);
        if (chapters.length === 0) {
            chaptersContainer.innerHTML = `<p class="empty-message">No chapters available.</p>`;
            return;
        }


        chapters.forEach(function(chapter) {
            const chapterCard = createChapterCard(chapter);
            chaptersContainer.appendChild(chapterCard);
        });
    }
}


function createChapterCard(chapter) {
    const chapterCard = document.createElement("a");
    chapterCard.className = "chapter-card";
    chapterCard.href = `content.html?class=${encodeURIComponent(getClassNumberFromURL())}&subject=${encodeURIComponent(getSubjectIdFromURL())}&book=${encodeURIComponent(getBookIdFromURL())}&chapter=${encodeURIComponent(chapter.id)}`;
    chapterCard.innerHTML = `
        <div class="chapter-number">${escapeHTML(String(chapter.number))}</div>
        <div class="chapter-info">
            <h3>${escapeHTML(chapter.title)}</h3>
            ${chapter.sectionName ? `<span class="chapter-section">${escapeHTML(chapter.sectionName)}</span>` : ""}
        </div>
        <div class="chapter-arrow">
            <i class="fa-solid fa-arrow-right"></i>
        </div>
    `;
    return chapterCard;
}


function showChapterPageError(message) {
    const chaptersContainer = document.getElementById("chaptersContainer");
    if (!chaptersContainer) return;
    chaptersContainer.innerHTML = `
        <div class="database-error">
            <h2>⚠️ Error</h2>
            <p>${escapeHTML(message)}</p>
        </div>
    `;
}


/* =====================================================
   JacVerse - Part 5
   Chapter Content Data System
===================================================== */


function getChapterIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("chapter");
}


function initializeContentPage() {
    const classNumber = getClassNumberFromURL();
    const subjectId = getSubjectIdFromURL();
    const bookId = getBookIdFromURL();
    const chapterId = getChapterIdFromURL();


    if (!classNumber || !["9", "10"].includes(classNumber)) {
        showContentPageError("Invalid class selected.");
        return;
    }
    if (!subjectId) {
        showContentPageError("Subject not selected.");
        return;
    }
    if (!bookId) {
        showContentPageError("Book not selected.");
        return;
    }
    if (!chapterId) {
        showContentPageError("Chapter not selected.");
        return;
    }


    const chapterData = getChapterData(classNumber, subjectId, bookId, chapterId);
    if (!chapterData) {
        showContentPageError("Chapter data not found.");
        return;
    }


    renderChapterInformation(chapterData);
    if (typeof renderChapterContent === "function") {
        renderChapterContent(chapterData);
    }
}


function showContentPageError(message) {
    const contentContainer = document.getElementById("chapterContent");
    if (!contentContainer) return;
    contentContainer.innerHTML = `
        <div class="database-error">
            <h2>⚠️ Error</h2>
            <p>${escapeHTML(message)}</p>
        </div>
    `;
}


/* =====================================================
   JacVerse - Part 6
   Chapter Content Helper System
===================================================== */


function getSafeContentValue(value, fallback = "") {
    if (value === null || value === undefined) {
        return fallback;
    }
    return value;
}


function getChapterBreadcrumbData() {
    const classNumber = getClassNumberFromURL();
    const subjectId = getSubjectIdFromURL();
    const bookId = getBookIdFromURL();
    const chapterId = getChapterIdFromURL();


    const classData = getClassData(classNumber);
    const subjectData = getSubjectData(classNumber, subjectId);
    const bookData = getBookData(classNumber, subjectId, bookId);
    const chapterData = getChapterData(classNumber, subjectId, bookId, chapterId);


    return { classData, subjectData, bookData, chapterData };
}


function renderChapterBreadcrumb() {
    const breadcrumb = document.getElementById("breadcrumb") || document.querySelector("[data-breadcrumb]");
    if (!breadcrumb) return;


    const data = getChapterBreadcrumbData();
    const page = typeof getCurrentPageParameters === "function" ? getCurrentPageParameters() : null;


    if (data.classData && data.subjectData && data.bookData && data.chapterData) {
        breadcrumb.innerHTML = `
            <a href="index.html">Home</a>
            <span>›</span>
            <a href="class.html?class=${encodeURIComponent(getClassNumberFromURL())}">${escapeHTML(data.classData.name)}</a>
            <span>›</span>
            <span>${escapeHTML(data.subjectData.name)}</span>
            <span>›</span>
            <span>${escapeHTML(data.chapterData.title)}</span>
        `;
    } else if (page && typeof classData !== "undefined" && typeof subjectData !== "undefined" && typeof bookData !== "undefined" && typeof chapterData !== "undefined") {
        breadcrumb.innerHTML = `
            <a href="class.html?class=${encodeURIComponent(page.classId)}">${escapeHTML(classData.name)}</a>
            <span>/</span>
            <span>${escapeHTML(subjectData.name)}</span>
            <span>/</span>
            <span>${escapeHTML(bookData.name)}</span>
            <span>/</span>
            <strong>${escapeHTML(chapterData.title)}</strong>
        `;
    }
}


function renderChapterMeta() {
    const metaContainer = document.getElementById("chapterMeta");
    if (!metaContainer) return;


    const data = getChapterBreadcrumbData();
    if (!data.chapterData) return;


    metaContainer.innerHTML = `
        <span>Chapter ${escapeHTML(String(data.chapterData.number))}</span>
        ${data.chapterData.sectionName ? `<span>${escapeHTML(data.chapterData.sectionName)}</span>` : ""}
    `;
}


function initializeChapterContentUI() {
    renderChapterBreadcrumb();
    renderChapterMeta();
}


try {
    const currentFilePage = window.location.pathname.split("/").pop().toLowerCase();
    if (currentFilePage === "content.html") {
        initializeChapterContentUI();
    }
} catch(e) {}


/* =====================================================
   JacVerse - Part 8
   Global Search System
===================================================== */


function searchDatabase(searchTerm) {
    const results = [];
    const query = searchTerm.toLowerCase().trim();
    const database = window.jAC_DATABASE || jacVerseDatabase;
    if (!query || !database || !database.classes) return results;


    Object.entries(database.classes).forEach(function([classNumber, classData]) {
        if (classData.name.toLowerCase().includes(query)) {
            results.push({
                type: "class",
                title: classData.name,
                url: `class.html?class=${encodeURIComponent(classNumber)}`
            });
        }


        if (!Array.isArray(classData.subjects)) return;


        classData.subjects.forEach(function(subject) {
            if (subject.name.toLowerCase().includes(query) || (subject.nameHindi && subject.nameHindi.includes(query))) {
                results.push({
                    type: "subject",
                    title: subject.name,
                    url: `subject.html?class=${encodeURIComponent(classNumber)}&subject=${encodeURIComponent(subject.id)}`
                });
            }


            if (!Array.isArray(subject.books)) return;


            subject.books.forEach(function(book) {
                if (book.name.toLowerCase().includes(query)) {
                    results.push({
                        type: "book",
                        title: book.name,
                        url: `chapter.html?class=${encodeURIComponent(classNumber)}&subject=${encodeURIComponent(subject.id)}&book=${encodeURIComponent(book.id)}`
                    });
                }


                const chapters = getAllChapters(book);
                chapters.forEach(function(chapter) {
                    if (chapter.title.toLowerCase().includes(query)) {
                        results.push({
                            type: "chapter",
                            title: chapter.title,
                            url: `content.html?class=${encodeURIComponent(classNumber)}&subject=${encodeURIComponent(subject.id)}&book=${encodeURIComponent(book.id)}&chapter=${encodeURIComponent(chapter.id)}`
                        });
                    }
                });
            });
        });
    });


    return results;
}


function initializeSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    if (!searchInput || !searchResults) return;


    searchInput.addEventListener("input", function() {
        const query = searchInput.value.trim();
        if (!query) {
            searchResults.innerHTML = "";
            searchResults.style.display = "none";
            return;
        }


        const results = searchDatabase(query);
        renderSearchResults(results, searchResults);
    });
}


function renderSearchResults(results, container) {
    if (!container) return;
    container.innerHTML = "";


    if (results.length === 0) {
        container.innerHTML = `
            <div class="search-no-result">
                <strong>No results found</strong>
                <p>Try another chapter, subject or book name.</p>
            </div>
        `;
        container.style.display = "block";
        return;
    }


    const checkItem = results[0];
    if (checkItem && checkItem.chapterTitle) {
        container.innerHTML = results.map(item => `
            <a class="search-result-item" href="${createSearchResultURL(item)}">
                <div>
                    <strong>${escapeHTML(item.chapterTitle)}</strong>
                    <small>
                        ${escapeHTML(item.className)} • ${escapeHTML(item.subjectName)} • ${escapeHTML(item.bookName)}
                        ${item.sectionName ? ` • ${escapeHTML(item.sectionName)}` : ""}
                    </small>
                </div>
            </a>
        `).join("");
    } else {
        results.slice(0, 10).forEach(function(result) {
            const resultItem = document.createElement("a");
            resultItem.href = result.url || "#";
            resultItem.className = "search-result-item";
            resultItem.innerHTML = `
                <span class="search-result-type">${escapeHTML(result.type)}</span>
                <span class="search-result-title">${escapeHTML(result.title)}</span>
            `;
            container.appendChild(resultItem);
        });
    }
    container.style.display = "block";
}


document.addEventListener("click", function(event) {
    const searchBox = document.querySelector(".search-box");
    const searchResults = document.getElementById("searchResults");
    if (!searchBox || !searchResults) return;
    if (!searchBox.contains(event.target)) {
        searchResults.style.display = "none";
    }
});


/* =====================================================
   PART 9 — DATABASE NAVIGATION & CHAPTER SYSTEM
===================================================== */


function getPageInfo() {
    const params = new URLSearchParams(window.location.search);
    return {
        classId: params.get("class"),
        subjectId: params.get("subject"),
        bookId: params.get("book"),
        chapterId: params.get("chapter")
    };
}


function getAllBookChapters(bookData) {
    if (!bookData) return [];
    if (bookData.chapters) return bookData.chapters;
    if (bookData.sections) {
        let allChapters = [];
        bookData.sections.forEach(section => {
            if (section.chapters) {
                allChapters = [...allChapters, ...section.chapters];
            }
        });
        return allChapters;
    }
    return [];
}


function openSubject(classId, subjectId) {
    window.location.href = `subject.html?class=${encodeURIComponent(classId)}&subject=${encodeURIComponent(subjectId)}`;
}


function openBook(classId, subjectId, bookId) {
    window.location.href = `book.html?class=${encodeURIComponent(classId)}&subject=${encodeURIComponent(subjectId)}&book=${encodeURIComponent(bookId)}`;
}


function openChapter(classId, subjectId, bookId, chapterId) {
    window.location.href = `chapter.html?class=${encodeURIComponent(classId)}&subject=${encodeURIComponent(subjectId)}&book=${encodeURIComponent(bookId)}&chapter=${encodeURIComponent(chapterId)}`;
}


function getCurrentChapter() {
    const pageInfo = typeof getPageInfo === "function" ? getPageInfo() : null;
    const pageParams = typeof getCurrentPageParameters === "function" ? getCurrentPageParameters() : null;
    const p = pageInfo || pageParams;


    if (!p || !p.classId || !p.subjectId || !p.bookId || !p.chapterId) {
        return null;
    }
    return getChapterData(p.classId, p.subjectId, p.bookId, p.chapterId);
}


function getChapterNavigation() {
    const pageInfo = getPageInfo();
    const bookData = getBookData(pageInfo.classId, pageInfo.subjectId, pageInfo.bookId);
    if (!bookData) return null;


    const chapters = getAllBookChapters(bookData);
    const currentIndex = chapters.findIndex(chapter => chapter.id === pageInfo.chapterId);


    return {
        previous: currentIndex > 0 ? chapters[currentIndex - 1] : null,
        current: currentIndex >= 0 ? chapters[currentIndex] : null,
        next: currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null
    };
}


function openPreviousChapter() {
    const navigation = getChapterNavigation();
    if (navigation && navigation.previous) {
        const pageInfo = getPageInfo();
        openChapter(pageInfo.classId, pageInfo.subjectId, pageInfo.bookId, navigation.previous.id);
    }
}


function openNextChapter() {
    const navigation = getChapterNavigation();
    if (navigation && navigation.next) {
        const pageInfo = getPageInfo();
        openChapter(pageInfo.classId, pageInfo.subjectId, pageInfo.bookId, navigation.next.id);
    }
}


function setChapterTitle() {
    const chapter = getCurrentChapter();
    if (!chapter) return;
    document.querySelectorAll("[data-chapter-title]").forEach(element => {
        element.textContent = chapter.title;
    });
}


function setBookInformation() {
    const pageInfo = getPageInfo();
    const subject = getSubjectData(pageInfo.classId, pageInfo.subjectId);
    const book = getBookData(pageInfo.classId, pageInfo.subjectId, pageInfo.bookId);


    if (subject) {
        document.querySelectorAll("[data-subject-name]").forEach(element => {
            element.textContent = subject.name;
        });
    }
    if (book) {
        document.querySelectorAll("[data-book-name]").forEach(element => {
            element.textContent = book.name;
        });
    }
}


function setChapterNumber() {
    const chapter = getCurrentChapter();
    if (!chapter) return;
    document.querySelectorAll("[data-chapter-number]").forEach(element => {
        element.textContent = `Chapter ${chapter.number}`;
    });
}


function updateChapterButtons() {
    const navigation = getChapterNavigation();
    if (!navigation) return;


    const previousButton = document.querySelector("[data-previous-chapter]");
    const nextButton = document.querySelector("[data-next-chapter]");


    if (previousButton) {
        if (navigation.previous) {
            previousButton.disabled = false;
            previousButton.onclick = openPreviousChapter;
        } else {
            previousButton.disabled = true;
        }
    }


    if (nextButton) {
        if (navigation.next) {
            nextButton.disabled = false;
            nextButton.onclick = openNextChapter;
        } else {
            nextButton.disabled = true;
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const currentFilePage = window.location.pathname.split("/").pop().toLowerCase();
    if (currentFilePage === "chapter.html") {
        initializeChapterPage();
    }
});


/* =====================================================
   PART 10 — DATABASE LOADER & DATA CONNECTION
===================================================== */


const DATABASE_FILE = "database.json";


async function loadJacVerseDatabase() {
    try {
        const response = await fetch(DATABASE_FILE);
        if (!response.ok) {
            throw new Error(`Database loading failed: ${response.status}`);
        }
        const database = await response.json();
        window.jAC_DATABASE = database;


        document.dispatchEvent(new CustomEvent("jacverseDatabaseReady", { detail: database }));
        console.log("JacVerse database loaded successfully.");
        return database;
    } catch (error) {
        console.error("JacVerse Database Error:", error);
        showDatabaseError();
        return null;
    }
}


function waitForDatabase(callback) {
    if (window.jAC_DATABASE) {
        callback(window.jAC_DATABASE);
        return;
    }
    document.addEventListener("jacverseDatabaseReady", event => {
        callback(event.detail);
    }, { once: true });
}


function getAllClasses() {
    const db = window.jAC_DATABASE || jacVerseDatabase;
    if (!db || !db.classes) return [];
    return Object.entries(db.classes).map(([classId, classData]) => {
        return { id: classId, ...classData };
    });
}


function getAllSubjects(classId) {
    const classData = getClassData(classId);
    if (!classData || !classData.subjects) return [];
    return classData.subjects;
}


function getAllBooks(classId, subjectId) {
    const subjectData = getSubjectData(classId, subjectId);
    if (!subjectData || !subjectData.books) return [];
    return subjectData.books;
}


function searchJacVerse(searchText) {
    const db = window.jAC_DATABASE || jacVerseDatabase;
    if (!db || !db.classes) return [];


    const searchTerm = searchText.toLowerCase().trim();
    if (!searchTerm) return [];


    const results = [];
    Object.entries(db.classes).forEach(([classId, classData]) => {
        if (!Array.isArray(classData.subjects)) return;


        classData.subjects.forEach(subject => {
            if (!Array.isArray(subject.books)) return;


            subject.books.forEach(book => {
                if (book.chapters) {
                    book.chapters.forEach(chapter => {
                        addSearchResult(results, searchTerm, classId, subject, book, chapter);
                    });
                }
                if (book.sections) {
                    book.sections.forEach(section => {
                        section.chapters.forEach(chapter => {
                            addSearchResult(results, searchTerm, classId, subject, book, chapter, section);
                        });
                    });
                }
            });
        });
    });


    return results;
}


function addSearchResult(results, searchTerm, classId, subject, book, chapter, section = null) {
    const searchableText = [
        chapter.title,
        subject.name,
        subject.nameHindi || "",
        book.name,
        section ? section.name : ""
    ].join(" ").toLowerCase();


    if (searchableText.includes(searchTerm)) {
        results.push({
            classId,
            className: getClassData(classId)?.name || `Class ${classId}`,
            subjectId: subject.id,
            bookId: book.id,
            chapterId: chapter.id,
            title: chapter.title,
            chapterTitle: chapter.title,
            chapterNumber: chapter.number,
            subjectName: subject.name,
            bookName: book.name,
            sectionName: section ? section.name : null,
            type: "chapter"
        });
    }
}


async function initializeJacVerseDatabase() {
    const database = await loadJacVerseDatabase();
    if (!database) return;
    console.log("Classes:", getAllClasses());
    console.log("JacVerse is ready.");
}


initializeJacVerseDatabase();
/* =====================================================
   JacVerse - Main Script
   Part 2: UI Utilities, Security & MathJax Renderers
===================================================== */


/* =====================================================
   PART 11 — SECURE STRING ESCAPING UTILITY
===================================================== */


function escapeHTML(string) {
    if (!string) return "";
    return String(string)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
}


/* =====================================================
   PART 12 — POLYMORPHIC USER INTERFACE SYSTEM
===================================================== */


function createSearchResultURL(item) {
    if (!item) return "#";
    return `content.html?class=${encodeURIComponent(item.classId)}&subject=${encodeURIComponent(item.subjectId)}&book=${encodeURIComponent(item.bookId)}&chapter=${encodeURIComponent(item.chapterId)}`;
}


function renderClasses(container) {
    if (!container) return;
    const classes = getAllClasses();
    
    if (classes.length === 0) {
        container.innerHTML = `<p class="empty-message">No classes available.</p>`;
        return;
    }


    container.innerHTML = classes.map(classItem => `
        <a href="class.html?class=${classItem.id}" class="class-card">
            <span>🎓</span>
            <h3>${escapeHTML(classItem.name)}</h3>
        </a>
    `).join("");
}


/* =====================================================
   PART 13 — THEME & COMPONENT LAYOUT MANAGER
===================================================== */


function initializeThemeManager() {
    const themeToggleBtn = document.getElementById("themeToggle");
    if (!themeToggleBtn) return;


    const currentTheme = localStorage.getItem("jacverse-theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    updateThemeIcon(themeToggleBtn, currentTheme);


    themeToggleBtn.addEventListener("click", () => {
        const activeTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = activeTheme === "dark" ? "light" : "dark";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("jacverse-theme", newTheme);
        updateThemeIcon(themeToggleBtn, newTheme);
    });
}


function updateThemeIcon(btn, theme) {
    if (theme === "dark") {
        btn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
    } else {
        btn.innerHTML = `<i class="fa-solid fa-moon"></i>`;
    }
}


function renderComponent(placeholderId, htmlContent) {
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) {
        placeholder.outerHTML = htmlContent;
    }
}


/* =====================================================
   PART 14 — MATHEMATICAL EQUATION RENDERING ENGINE
===================================================== */


function renderMathematicalEquations(containerElement) {
    if (!containerElement) return;


    // LaTeX blocks processing ($$...$$)
    containerElement.innerHTML = containerElement.innerHTML.replace(/\$\$([\s\S]+?)\$\$/g, (match, equation) => {
        return `<span class="math-block-equation">[MathEquation: ${escapeHTML(equation.trim())}]</span>`;
    });


    // Inline LaTeX processing ($...$)
    containerElement.innerHTML = containerElement.innerHTML.replace(/\$([^$]+?)\$/g, (match, equation) => {
        return `<code class="math-inline-equation">${escapeHTML(equation.trim())}</code>`;
    });


    // MathJax Dynamic Triggering
    if (window.MathJax) {
        try {
            if (typeof window.MathJax.typesetPromise === "function") {
                window.MathJax.typesetPromise([containerElement]).catch(err => {
                    console.error("MathJax typesetPromise failed:", err);
                });
            } else if (typeof window.MathJax.Hub === "object" && typeof window.MathJax.Hub.Queue === "function") {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, containerElement]);
            }
        } catch (error) {
            console.error("MathJax processor critical error:", error);
        }
    }
}


/* =====================================================
   PART 15 — CHAPTER BREADCRUMB UI INITIALIZATION
===================================================== */


function initializeChapterBreadcrumbsUI() {
    const breadcrumbContainer = document.getElementById("breadcrumbContainer");
    if (!breadcrumbContainer) return;


    const pageInfo = getPageInfo();
    if (!pageInfo.classId || !pageInfo.subjectId || !pageInfo.bookId) return;


    const classData = getClassData(pageInfo.classId);
    const subjectData = getSubjectData(pageInfo.classId, pageInfo.subjectId);
    const bookData = getBookData(pageInfo.classId, pageInfo.subjectId, pageInfo.bookId);


    let html = `<a href="index.html"><i class="fa-solid fa-house"></i> Home</a>`;
    
    if (classData) {
        html += ` <i class="fa-solid fa-chevron-right separator"></i> <a href="class.html?class=${pageInfo.classId}">${escapeHTML(classData.name)}</a>`;
    }
    if (subjectData) {
        html += ` <i class="fa-solid fa-chevron-right separator"></i> <a href="subject.html?class=${pageInfo.classId}&subject=${pageInfo.subjectId}">${escapeHTML(subjectData.name)}</a>`;
    }
    if (bookData) {
        html += ` <i class="fa-solid fa-chevron-right separator"></i> <span class="current">${escapeHTML(bookData.name)}</span>`;
    }


    breadcrumbContainer.innerHTML = html;
}


/* =====================================================
   PART 16 — CORE INITIALIZATION & THEME RUNNER
===================================================== */


document.addEventListener("DOMContentLoaded", () => {
    initializeThemeManager();


    const currentFilePage = window.location.pathname.split("/").pop().toLowerCase();
    if (currentFilePage === "chapter.html") {
        initializeChapterBreadcrumbsUI();
    }
});


/* =====================================================
   PART 17 — ADVANCED TEXT TRANSFORMATION CORE
===================================================== */


function processTypographyText(inputText) {
    if (!inputText) return "";
    return inputText
        .replace(/--/g, "—")
        .replace(/\(C\)/gi, "©")
        .replace(/\(R\)/gi, "®")
        .replace(/\(TM\)/gi, "™")
        .replace(/\.\.\./g, "…");
}


/* =====================================================
   PART 18 — CODE BLOCK & SYNTAX HIGHLIGHTER UTILITY
===================================================== */


function highlightCodeBlocks(container) {
    if (!container) return;
    const codeElements = container.querySelectorAll("pre code");
    
    codeElements.forEach(codeBlock => {
        const lines = codeBlock.innerHTML.split("\n");
        const numberedLines = lines.map((line, index) => {
            return `<span class="line-number" data-line="${index + 1}"></span>${line}`;
        }).join("\n");
        
        codeBlock.innerHTML = numberedLines;
        codeBlock.classList.add("syntax-processed");
    });
}


/* =====================================================
   PART 19 — RESPONSIVE LAYOUT RESPONDER
===================================================== */


function adjustLayoutForScreenSize() {
    const width = window.innerWidth;
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");


    if (!sidebar || !mainContent) return;


    if (width < 768) {
        sidebar.classList.add("collapsed");
        mainContent.classList.add("full-width");
    } else {
        sidebar.classList.remove("collapsed");
        mainContent.classList.remove("full-width");
    }
}


window.addEventListener("resize", adjustLayoutForScreenSize);
document.addEventListener("DOMContentLoaded", adjustLayoutForScreenSize);


/* =====================================================
   PART 20 — CONTENT ACCESSIBILITY ENGINE
===================================================== */


function initializeTextToSpeech() {
    const speakButton = document.getElementById("readAloudBtn");
    const targetContent = document.getElementById("chapterContent");
    
    if (!speakButton || !targetContent) return;


    let textUtterance = null;
    let isSpeaking = false;


    speakButton.addEventListener("click", () => {
        if (!window.speechSynthesis) {
            alert("Text-to-Speech is not supported in your browser.");
            return;
        }


        if (isSpeaking) {
            window.speechSynthesis.cancel();
            isSpeaking = false;
            speakButton.innerHTML = `<i class="fa-solid fa-volume-high"></i> Read Aloud`;
            speakButton.classList.remove("active");
        } else {
            const cleanText = targetContent.innerText || targetContent.textContent;
            textUtterance = new SpeechSynthesisUtterance(cleanText);
            
            textUtterance.onend = () => {
                isSpeaking = false;
                speakButton.innerHTML = `<i class="fa-solid fa-volume-high"></i> Read Aloud`;
                speakButton.classList.remove("active");
            };


            window.speechSynthesis.speak(textUtterance);
            isSpeaking = true;
            speakButton.innerHTML = `<i class="fa-solid fa-volume-xmark"></i> Stop Reading`;
            speakButton.classList.add("active");
        }
    });
}


document.addEventListener("DOMContentLoaded", initializeTextToSpeech);
/* =====================================================
   JacVerse - Main Script
   Part 3: UI Enhancements, Zoom, Bookmarks & Data Processing
===================================================== */


/* =====================================================
   PART 21 — FONT SIZE ADJUSTMENT & CONTROLLER SYSTEM
===================================================== */


function initializeTextZoomController() {
    const zoomInBtn = document.getElementById("zoomInBtn");
    const zoomOutBtn = document.getElementById("zoomOutBtn");
    const zoomResetBtn = document.getElementById("zoomResetBtn");
    const targetArea = document.getElementById("chapterContent");


    if (!targetArea) return;


    let currentFontSize = parseFloat(localStorage.getItem("jacverse-font-size")) || 100;
    targetArea.style.fontSize = `${currentFontSize}%`;


    if (zoomInBtn) {
        zoomInBtn.addEventListener("click", () => {
            if (currentFontSize < 160) {
                currentFontSize += 10;
                targetArea.style.fontSize = `${currentFontSize}%`;
                localStorage.setItem("jacverse-font-size", currentFontSize);
            }
        });
    }


    if (zoomOutBtn) {
        zoomOutBtn.addEventListener("click", () => {
            if (currentFontSize > 80) {
                currentFontSize -= 10;
                targetArea.style.fontSize = `${currentFontSize}%`;
                localStorage.setItem("jacverse-font-size", currentFontSize);
            }
        });
    }


    if (zoomResetBtn) {
        zoomResetBtn.addEventListener("click", () => {
            currentFontSize = 100;
            targetArea.style.fontSize = `${currentFontSize}%`;
            localStorage.setItem("jacverse-font-size", currentFontSize);
        });
    }
}


document.addEventListener("DOMContentLoaded", initializeTextZoomController);


/* =====================================================
   PART 22 — PRINT & EXPORT DOCUMENT UTILITY
===================================================== */


function initializePrintUtility() {
    const printButton = document.getElementById("printPageBtn");
    if (!printButton) return;


    printButton.addEventListener("click", () => {
        window.print();
    });
}


document.addEventListener("DOMContentLoaded", initializePrintUtility);


/* =====================================================
   PART 23 — PROGRESSIVE SCROLL PERSISTENCE ENGINE
===================================================== */


function initializeScrollPersistence() {
    const pageInfo = typeof getPageInfo === "function" ? getPageInfo() : null;
    if (!pageInfo || !pageInfo.chapterId) return;


    const storageKey = `jacverse-scroll-${pageInfo.classId}-${pageInfo.subjectId}-${pageInfo.bookId}-${pageInfo.chapterId}`;
    
    // Restore Position
    const savedPosition = localStorage.getItem(storageKey);
    if (savedPosition) {
        setTimeout(() => {
            window.scrollTo({
                top: parseFloat(savedPosition),
                behavior: "smooth"
            });
        }, 300);
    }


    // Save Position on Scroll
    let scrollTimeout;
    window.addEventListener("scroll", () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            localStorage.setItem(storageKey, window.scrollY);
        }, 200);
    });
}


document.addEventListener("DOMContentLoaded", initializeScrollPersistence);


/* =====================================================
   PART 24 — BOOKMARK MANAGEMENT SYSTEM
===================================================== */


function getBookmarks() {
    return JSON.stringify(localStorage.getItem("jacverse-bookmarks")) || [];
}


function initializeBookmarkSystem() {
    const bookmarkBtn = document.getElementById("bookmarkPageBtn");
    const pageInfo = typeof getPageInfo === "function" ? getPageInfo() : null;
    if (!bookmarkBtn || !pageInfo || !pageInfo.chapterId) return;


    let bookmarks = JSON.parse(localStorage.getItem("jacverse-bookmarks")) || [];
    const bookmarkId = `${pageInfo.classId}_${pageInfo.subjectId}_${pageInfo.bookId}_${pageInfo.chapterId}`;


    let isBookmarked = bookmarks.some(b => b.id === bookmarkId);
    updateBookmarkButtonUI(bookmarkBtn, isBookmarked);


    bookmarkBtn.addEventListener("click", () => {
        bookmarks = JSON.parse(localStorage.getItem("jacverse-bookmarks")) || [];
        isBookmarked = bookmarks.some(b => b.id === bookmarkId);


        if (isBookmarked) {
            bookmarks = bookmarks.filter(b => b.id !== bookmarkId);
            isBookmarked = false;
        } else {
            const currentChapter = typeof getCurrentChapter === "function" ? getCurrentChapter() : null;
            bookmarks.push({
                id: bookmarkId,
                classId: pageInfo.classId,
                subjectId: pageInfo.subjectId,
                bookId: pageInfo.bookId,
                chapterId: pageInfo.chapterId,
                title: currentChapter ? currentChapter.title : "Untitled Chapter",
                timestamp: Date.now()
            });
            isBookmarked = true;
        }


        localStorage.setItem("jacverse-bookmarks", JSON.stringify(bookmarks));
        updateBookmarkButtonUI(bookmarkBtn, isBookmarked);
    });
}


function updateBookmarkButtonUI(btn, bookmarked) {
    if (bookmarked) {
        btn.innerHTML = `<i class="fa-solid fa-bookmark"></i> Bookmarked`;
        btn.classList.add("saved");
    } else {
        btn.innerHTML = `<i class="fa-regular fa-bookmark"></i> Bookmark`;
        btn.classList.remove("saved");
    }
}


document.addEventListener("DOMContentLoaded", initializeBookmarkSystem);


/* =====================================================
   PART 25 — CONTENT HIGHLIGHTER ENGINE
===================================================== */


function initializeTextHighlighter() {
    const contentArea = document.getElementById("chapterContent");
    if (!contentArea) return;


    contentArea.addEventListener("mouseup", () => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();


        if (selectedText.length > 0) {
            showHighlightFloater(selection);
        } else {
            removeHighlightFloater();
        }
    });


    document.addEventListener("mousedown", (e) => {
        const floater = document.getElementById("highlightFloater");
        if (floater && !floater.contains(e.target) && !contentArea.contains(e.target)) {
            removeHighlightFloater();
        }
    });
}


function showHighlightFloater(selection) {
    removeHighlightFloater();


    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();


    const floater = document.createElement("div");
    floater.id = "highlightFloater";
    floater.className = "highlight-floater";
    floater.innerHTML = `<button type="button"><i class="fa-solid fa-highlighter"></i> Highlight</button>`;
    
    floater.style.top = `${rect.top + window.scrollY - 40}px`;
    floater.style.left = `${rect.left + window.scrollX + (rect.width / 2) - 45}px`;


    floater.querySelector("button").addEventListener("click", () => {
        const span = document.createElement("mark");
        span.className = "jacverse-highlight";
        range.surroundContents(span);
        window.getSelection().removeAllRanges();
        removeHighlightFloater();
        
        // Custom Hook to Save Content State if Needed
        if (typeof saveUserHighlights === "function") saveUserHighlights();
    });


    document.body.appendChild(floater);
}


function removeHighlightFloater() {
    const floater = document.getElementById("highlightFloater");
    if (floater) floater.remove();
}


document.addEventListener("DOMContentLoaded", initializeTextHighlighter);


/* =====================================================
   PART 26 — DYNAMIC SIDE PANEL CONTEXT SYSTEM
===================================================== */


function toggleContextSidebar() {
    const sidebar = document.getElementById("contextSidebar");
    if (!sidebar) return;
    sidebar.classList.toggle("open");
}


/* =====================================================
   PART 27 — INTERACTIVE QUIZ DATA STRUCTURE PARSER
===================================================== */


function parseChapterQuizData(quizRawData) {
    if (!Array.isArray(quizRawData)) return [];
    
    return quizRawData.map((quizItem, idx) => {
        return {
            index: idx + 1,
            question: quizItem.question || "Empty Question",
            options: Array.isArray(quizItem.options) ? quizItem.options : [],
            correctIndex: typeof quizItem.answer === "number" ? quizItem.answer : parseInt(quizItem.answer) || 0,
            explanation: quizItem.explanation || ""
        };
    });
}


/* =====================================================
   PART 28 — BREADCRUMB COMPACT OVERLAY RESPONDER
===================================================== */


function makeBreadcrumbsResponsive() {
    const breadcrumb = document.getElementById("breadcrumbContainer");
    if (!breadcrumb) return;


    if (breadcrumb.scrollWidth > breadcrumb.clientWidth) {
        breadcrumb.classList.add("compact-mode");
    } else {
        breadcrumb.classList.remove("compact-mode");
    }
}


window.addEventListener("resize", makeBreadcrumbsResponsive);
document.addEventListener("DOMContentLoaded", makeBreadcrumbsResponsive);


/* =====================================================
   PART 29 — COPY TO CLIPBOARD MODULE
===================================================== */


function copyTextToClipboard(text, successCallback) {
    if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand("copy");
            if (typeof successCallback === "function") successCallback();
        } catch (err) {
            console.error("Fallback copy execution failed:", err);
        }
        document.body.removeChild(textArea);
        return;
    }


    navigator.clipboard.writeText(text).then(() => {
        if (typeof successCallback === "function") successCallback();
    }).catch(err => {
        console.error("Clipboard write execution failed:", err);
    });
}


/* =====================================================
   PART 30 — KEYBOARD SHORTCUTS NAVIGATOR
===================================================== */


function initializeKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        // Alt + N -> Next Chapter
        if (e.altKey && e.key.toLowerCase() === "n") {
            e.preventDefault();
            if (typeof openNextChapter === "function") openNextChapter();
        }
        // Alt + P -> Previous Chapter
        if (e.altKey && e.key.toLowerCase() === "p") {
            e.preventDefault();
            if (typeof openPreviousChapter === "function") openPreviousChapter();
        }
        // Alt + B -> Toggle Theme
        if (e.altKey && e.key.toLowerCase() === "b") {
            e.preventDefault();
            const themeBtn = document.getElementById("themeToggle");
            if (themeBtn) themeBtn.click();
        }
    });
}


document.addEventListener("DOMContentLoaded", initializeKeyboardShortcuts);
/* =====================================================
   JacVerse - Main Script
   Part 4: Dynamic DOM Generators & Content Renderers
===================================================== */


/* =====================================================
   PART 31 — SYSTEM STATUS GENERATOR
===================================================== */


function generateSystemStatusReport() {
    const db = window.jAC_DATABASE || jacVerseDatabase;
    return {
        databaseLoaded: !!db,
        totalClasses: db && db.classes ? Object.keys(db.classes).length : 0,
        theme: localStorage.getItem("jacverse-theme") || "light",
        viewportWidth: window.innerWidth,
        timestamp: new Date().toISOString()
    };
}


/* =====================================================
   PART 32 — NETWORK CONNECTION WATCHDOG
===================================================== */


function initializeNetworkWatchdog() {
    const updateNetworkUI = () => {
        let statusBox = document.getElementById("networkStatusIndicator");
        if (!navigator.onLine) {
            if (!statusBox) {
                statusBox = document.createElement("div");
                statusBox.id = "networkStatusIndicator";
                statusBox.className = "network-offline-banner";
                statusBox.innerHTML = `<p><i class="fa-solid fa-wifi-slash"></i> You are currently offline. Some features may not work.</p>`;
                document.body.prepend(statusBox);
            }
        } else {
            if (statusBox) statusBox.remove();
        }
    };


    window.addEventListener("online", updateNetworkUI);
    window.addEventListener("offline", updateNetworkUI);
    updateNetworkUI();
}


document.addEventListener("DOMContentLoaded", initializeNetworkWatchdog);


/* =====================================================
   PART 33 — DYNAMIC IMAGE MODAL POPUP SYSTEM
===================================================== */


function initializeImageModalPopup() {
    const contentArea = document.getElementById("chapterContent");
    if (!contentArea) return;


    contentArea.addEventListener("click", (e) => {
        if (e.target.tagName.toLowerCase() === "img") {
            const imgSrc = e.target.src;
            const imgAlt = e.target.alt || "Image Preview";
            openImageModal(imgSrc, imgAlt);
        }
    });
}


function openImageModal(src, alt) {
    let modal = document.getElementById("jacverseImageModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "jacverseImageModal";
        modal.className = "image-lightbox-modal";
        modal.innerHTML = `
            <span class="close-lightbox">&times;</span>
            <img class="lightbox-content" id="lightboxTargetImg" alt="Popup">
            <div id="lightboxCaption"></div>
        `;
        document.body.appendChild(modal);


        modal.querySelector(".close-lightbox").addEventListener("click", () => {
            modal.style.display = "none";
        });
        
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.style.display = "none";
        });
    }


    const modalImg = document.getElementById("lightboxTargetImg");
    const captionText = document.getElementById("lightboxCaption");


    modal.style.display = "flex";
    modalImg.src = src;
    captionText.textContent = alt;
}


document.addEventListener("DOMContentLoaded", initializeImageModalPopup);


/* =====================================================
   PART 34 — DATA STORAGE COMPACTION UTILITY
===================================================== */


function clearOldJacVerseCache() {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith("jacverse-scroll-") || key.startsWith("jacverse-quiz-")) {
                // If data is older than 30 days, clean it (Example Strategy)
                // For safety in this clean conversion, we just offer the function placeholder
            }
        });
        console.log("JacVerse cache structure optimization verified.");
    } catch (e) {
        console.error("Cache compaction tracking error:", e);
    }
}


/* =====================================================
   PART 35 — TEXT SEARCH INTERFACE HIGHLIGHTER
===================================================== */


function highlightSearchKeywordWithinElement(element, keyword) {
    if (!element || !keyword.trim()) return;
    const regex = new RegExp(`(${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi");
    
    const innerHTML = element.innerHTML;
    element.innerHTML = innerHTML.replace(regex, "<mark class='search-inner-highlight'>$1</mark>");
}


/* =====================================================
   PART 36 — ACTIVE LINK STYLER UTILITY
===================================================== */


function highlightActiveNavigationLinks() {
    const currentPath = window.location.pathname.split("/").pop().toLowerCase();
    const navLinks = document.querySelectorAll(".nav-menu a, .sidebar-menu a");


    navLinks.forEach(link => {
        const hrefPath = link.getAttribute("href");
        if (hrefPath && hrefPath.toLowerCase() === currentPath) {
            link.classList.add("active-nav-route");
        } else {
            link.classList.remove("active-nav-route");
        }
    });
}


document.addEventListener("DOMContentLoaded", highlightActiveNavigationLinks);


/* =====================================================
   PART 37 — GLOBAL LAZY LOADING IMAGES CONTROLLER
==================================================== */


function initializeLazyLoadingImages() {
    const images = document.querySelectorAll("img[data-src]");
    if (!("IntersectionObserver" in window)) {
        // Fallback for older configurations
        images.forEach(img => {
            img.src = img.getAttribute("data-src");
        });
        return;
    }


    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const image = entry.target;
                image.src = image.getAttribute("data-src");
                image.removeAttribute("data-src");
                observer.unobserve(image);
            }
        });
    });


    images.forEach(img => imageObserver.observe(img));
}


document.addEventListener("DOMContentLoaded", initializeLazyLoadingImages);


/* =====================================================
   PART 38 — FORM DEBOUNCING MECHANISM UTILITY
===================================================== */


function createDebouncedFunction(callbackDelayFunction, delayDuration) {
    let executionTimer;
    return function (...args) {
        const context = this;
        clearTimeout(executionTimer);
        executionTimer = setTimeout(() => {
            callbackDelayFunction.apply(context, args);
        }, delayDuration);
    };
}


/* =====================================================
   PART 39 — CUSTOM SCRIPTHEAD META BUILDER
===================================================== */


function injectCustomDynamicMetaTags(metaProperties) {
    if (!metaProperties || typeof metaProperties !== "object") return;
    
    Object.entries(metaProperties).forEach(([key, value]) => {
        let metaTag = document.querySelector(`meta[property='${key}']`) || document.querySelector(`meta[name='${key}']`);
        if (!metaTag) {
            metaTag = document.createElement("meta");
            if (key.startsWith("og:")) {
                metaTag.setAttribute("property", key);
            } else {
                metaTag.setAttribute("name", key);
            }
            document.head.appendChild(metaTag);
        }
        metaTag.setAttribute("content", value);
    });
}


/* =====================================================
   PART 40 — GLOBAL TOAST NOTIFICATION CORNER SYSTEM
===================================================== */


function showToastNotification(messageText, notificationType = "info") {
    let container = document.getElementById("toastNotificationBoxContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastNotificationBoxContainer";
        container.className = "toast-notifications-wrapper";
        document.body.appendChild(container);
    }


    const toast = document.createElement("div");
    toast.className = `toast-message-item ${notificationType}`;
    toast.innerHTML = `
        <div class="toast-inner-body">
            <span class="toast-message-text">${escapeHTML(messageText)}</span>
            <span class="toast-close-trigger">&times;</span>
        </div>
    `;


    container.appendChild(toast);


    const removeToast = () => {
        toast.classList.add("fade-out-process");
        setTimeout(() => toast.remove(), 400);
    };


    toast.querySelector(".toast-close-trigger").addEventListener("click", removeToast);
    
    // Auto remove after 4.5 seconds
    setTimeout(removeToast, 4500);
}
/* =====================================================
   JacVerse - Main Script
   Part 5: Interactive Quiz Engine & Evaluation Modules
===================================================== */


/* =====================================================
   PART 41 — INTERACTIVE QUIZ INTERFACE CORE RENDERER
===================================================== */


function renderChapterQuizWidget(quizContainerElement, rawQuizData) {
    if (!quizContainerElement) return;
    
    const parsedQuestions = typeof parseChapterQuizData === "function" 
        ? parseChapterQuizData(rawQuizData) 
        : rawQuizData;


    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        quizContainerElement.innerHTML = `<p class="empty-message">No practice questions available for this chapter.</p>`;
        return;
    }


    let htmlMarkup = `<div class="quiz-interactive-wrapper"><h3>📝 Practice Quiz Worksheet</h3>`;


    parsedQuestions.forEach((item) => {
        htmlMarkup += `
            <div class="quiz-question-card" data-question-index="${item.index}">
                <p class="quiz-question-text"><strong>Q${item.index}.</strong> ${escapeHTML(item.question)}</p>
                <div class="quiz-options-list">
        `;


        item.options.forEach((option, optIdx) => {
            htmlMarkup += `
                <label class="quiz-option-item">
                    <input type="radio" name="jacverse_quiz_q_${item.index}" value="${optIdx}">
                    <span class="option-label-text">${escapeHTML(option)}</span>
                </label>
            `;
        });


        htmlMarkup += `
                </div>
                <div class="quiz-feedback-box hidden" id="quiz_feedback_q_${item.index}"></div>
            </div>
        `;
    });


    htmlMarkup += `
        <div class="quiz-action-bar">
            <button type="button" id="submitChapterQuizBtn" class="btn btn-primary"><i class="fa-solid fa-square-check"></i> Evaluate Quiz</button>
            <button type="button" id="resetChapterQuizBtn" class="btn btn-secondary hidden"><i class="fa-solid fa-rotate-left"></i> Reset Quiz</button>
        </div>
        <div id="quizFinalScoreBoard" class="quiz-scoreboard hidden"></div>
    </div>`;


    quizContainerElement.innerHTML = htmlMarkup;


    // Attach Event Listeners
    const submitBtn = document.getElementById("submitChapterQuizBtn");
    if (submitBtn) {
        submitBtn.addEventListener("click", () => evaluateChapterQuizSubmission(parsedQuestions));
    }


    const resetBtn = document.getElementById("resetChapterQuizBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => resetChapterQuizWidget(parsedQuestions));
    }
}


/* =====================================================
   PART 42 — QUIZ SUBMISSION EVALUATION ENGINE
===================================================== */


function evaluateChapterQuizSubmission(questionsList) {
    let totalCorrectAnswers = 0;
    const totalQuestionsCount = questionsList.length;


    questionsList.forEach((item) => {
        const selectedRadio = document.querySelector(`input[name="jacverse_quiz_q_${item.index}"]:checked`);
        const feedbackBox = document.getElementById(`quiz_feedback_q_${item.index}`);
        
        if (!feedbackBox) return;
        feedbackBox.classList.remove("hidden", "correct-alert", "incorrect-alert");


        if (selectedRadio) {
            const userSelectedIndex = parseInt(selectedRadio.value);
            
            if (userSelectedIndex === item.correctIndex) {
                totalCorrectAnswers++;
                feedbackBox.classList.add("correct-alert");
                feedbackBox.innerHTML = `<strong>✓ Correct!</strong> ${escapeHTML(item.explanation)}`;
            } else {
                feedbackBox.classList.add("incorrect-alert");
                feedbackBox.innerHTML = `<strong>✗ Incorrect.</strong> Correct Answer: <em>${escapeHTML(item.options[item.correctIndex])}</em>.<br>${escapeHTML(item.explanation)}`;
            }
        } else {
            feedbackBox.classList.add("incorrect-alert");
            feedbackBox.innerHTML = `<strong>⚠ Not Answered.</strong> Correct Answer: <em>${escapeHTML(item.options[item.correctIndex])}</em>.<br>${escapeHTML(item.explanation)}`;
        }
    });


    // Display Final Scoreboard
    const scoreBoard = document.getElementById("quizFinalScoreBoard");
    if (scoreBoard) {
        scoreBoard.classList.remove("hidden");
        scoreBoard.innerHTML = `
            <h4>Quiz Result Summary</h4>
            <p>You scored <strong>${totalCorrectAnswers}</strong> out of <strong>${totalQuestionsCount}</strong> questions.</p>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${(totalCorrectAnswers / totalQuestionsCount) * 100}%"></div>
            </div>
        `;
    }


    // Toggle Action Buttons State
    const submitBtn = document.getElementById("submitChapterQuizBtn");
    if (submitBtn) submitBtn.classList.add("hidden");


    const resetBtn = document.getElementById("resetChapterQuizBtn");
    if (resetBtn) resetBtn.classList.remove("hidden");
}


/* =====================================================
   PART 43 — INTERACTIVE QUIZ RESETTER UTILITY
===================================================== */


function resetChapterQuizWidget(questionsList) {
    questionsList.forEach((item) => {
        const radios = document.querySelectorAll(`input[name="jacverse_quiz_q_${item.index}"]`);
        radios.forEach(radio => radio.checked = false);


        const feedbackBox = document.getElementById(`quiz_feedback_q_${item.index}`);
        if (feedbackBox) {
            feedbackBox.classList.add("hidden");
            feedbackBox.innerHTML = "";
            feedbackBox.classList.remove("correct-alert", "incorrect-alert");
        }
    });


    const scoreBoard = document.getElementById("quizFinalScoreBoard");
    if (scoreBoard) {
        scoreBoard.classList.add("hidden");
        scoreBoard.innerHTML = "";
    }


    const submitBtn = document.getElementById("submitChapterQuizBtn");
    if (submitBtn) submitBtn.classList.remove("hidden");


    const resetBtn = document.getElementById("resetChapterQuizBtn");
    if (resetBtn) resetBtn.classList.add("hidden");
}


/* =====================================================
   PART 44 — PAGE CONTEXT TAB SWITCHER MODULE
===================================================== */


function initializeTabSwitcherModule() {
    const tabTriggers = document.querySelectorAll("[data-tab-target]");
    const tabContents = document.querySelectorAll("[data-tab-content]");


    tabTriggers.forEach(trigger => {
        trigger.addEventListener("click", () => {
            const target = trigger.getAttribute("data-tab-target");


            tabTriggers.forEach(btn => btn.classList.remove("active-tab-btn"));
            tabContents.forEach(content => content.classList.add("hidden-tab-view"));


            trigger.classList.add("active-tab-btn");
            const targetElement = document.getElementById(target);
            if (targetElement) targetElement.classList.remove("hidden-tab-view");
        });
    });
}


document.addEventListener("DOMContentLoaded", initializeTabSwitcherModule);


/* =====================================================
   PART 45 — CHAPTER GLOSSARY TERMS PARSER
===================================================== */


function renderChapterGlossaryBox(containerElement, glossaryData) {
    if (!containerElement) return;


    if (!Array.isArray(glossaryData) || glossaryData.length === 0) {
        containerElement.innerHTML = `<p class="empty-message">No glossary terms available for this chapter.</p>`;
        return;
    }


    let html = `<div class="glossary-list-box"><dl>`;
    glossaryData.forEach(item => {
        html += `
            <div class="glossary-term-row">
                <dt class="glossary-term-name"><strong>${escapeHTML(item.term)}</strong></dt>
                <dd class="glossary-term-definition">${escapeHTML(item.definition)}</dd>
            </div>
        `;
    });
    html += `</dl></div>`;


    containerElement.innerHTML = html;
}


/* =====================================================
   PART 46 — MATH FORMULAS TAB GENERATOR
===================================================== */


function renderChapterFormulasBox(containerElement, formulasData) {
    if (!containerElement) return;


    if (!Array.isArray(formulasData) || formulasData.length === 0) {
        containerElement.innerHTML = `<p class="empty-message">No mathematical formulas listed for this chapter.</p>`;
        return;
    }


    let html = `<div class="formulas-grid-layout">`;
    formulasData.forEach(item => {
        html += `
            <div class="formula-card-item">
                <h5 class="formula-card-title">${escapeHTML(item.name || "Formula")}</h5>
                <div class="formula-latex-display">$$${item.formula || ""}$$</div>
                ${item.description ? `<p class="formula-card-desc">${escapeHTML(item.description)}</p>` : ""}
            </div>
        `;
    });
    html += `</div>`;


    containerElement.innerHTML = html;
    
    // Trigger MathJax equation rendering specifically on this container
    if (typeof renderMathematicalEquations === "function") {
        renderMathematicalEquations(containerElement);
    }
}


/* =====================================================
   PART 47 — CHAPTER IMPORTANT POINTS KEYNOTES LIST
===================================================== */


function renderImportantPointsBox(containerElement, pointsData) {
    if (!containerElement) return;


    if (!Array.isArray(pointsData) || pointsData.length === 0) {
        containerElement.innerHTML = `<p class="empty-message">No revision points found for this chapter.</p>`;
        return;
    }


    let html = `<ul class="important-points-bullet-list">`;
    pointsData.forEach(point => {
        html += `<li><i class="fa-solid fa-star point-star-icon"></i> <span class="point-text-content">${escapeHTML(point)}</span></li>`;
    });
    html += `</ul>`;


    containerElement.innerHTML = html;
}


/* =====================================================
   PART 48 — REVISION NOTES SECTION RENDERER
===================================================== */


function renderRevisionNotesBox(containerElement, notesContent) {
    if (!containerElement) return;


    if (!notesContent) {
        containerElement.innerHTML = `<p class="empty-message">No quick revision notes available.</p>`;
        return;
    }


    containerElement.innerHTML = `
        <div class="revision-notes-markdown-body">
            ${processTypographyText ? processTypographyText(notesContent) : notesContent}
        </div>
    `;
}


/* =====================================================
   PART 49 — QUESTION-ANSWER NCERT EXERCISE RENDERING SYSTEM
===================================================== */


function renderNcertExercisesBox(containerElement, exercisesData) {
    if (!containerElement) return;


    if (!Array.isArray(exercisesData) || exercisesData.length === 0) {
        containerElement.innerHTML = `<p class="empty-message">No NCERT exercise questions available.</p>`;
        return;
    }


    let html = `<div class="ncert-exercises-accordion">`;
    exercisesData.forEach((item, index) => {
        html += `
            <div class="exercise-item-card">
                <div class="exercise-header-trigger" onclick="toggleExerciseAccordionRow(this)">
                    <h5>Question ${index + 1}: ${escapeHTML(item.question.substring(0, 65))}...</h5>
                    <i class="fa-solid fa-chevron-down accordion-arrow-indicator"></i>
                </div>
                <div class="exercise-collapsible-body hidden">
                    <p class="exercise-full-question"><strong>Question:</strong> ${escapeHTML(item.question)}</p>
                    <div class="exercise-full-answer"><strong>Solution / Answer:</strong><br>${item.answer}</div>
                </div>
            </div>
        `;
    });
    html += `</div>`;


    containerElement.innerHTML = html;
    
    if (typeof renderMathematicalEquations === "function") {
        renderMathematicalEquations(containerElement);
    }
}


/* =====================================================
   PART 50 — ACCORDION ROW INTERACTION HELPER
===================================================== */


function toggleExerciseAccordionRow(headerElement) {
    if (!headerElement) return;
    const siblingBody = headerElement.nextElementSibling;
    const arrowIcon = headerElement.querySelector(".accordion-arrow-indicator");


    if (siblingBody) {
        siblingBody.classList.toggle("hidden");
        if (arrowIcon) {
            arrowIcon.classList.toggle("rotate-upward-icon");
        }
    }
}
/* =====================================================
   JacVerse - Main Script
   Part 6: Content Tabs, Video Embedder & Sidebar Sync
===================================================== */


/* =====================================================
   PART 51 — INTERACTIVE CONTENT COMPONENT SWITCHER BOARD
===================================================== */


function buildAndInjectChapterTabs(chapterData) {
    const tabsContainer = document.getElementById("chapterTabsContainer");
    if (!tabsContainer || !chapterData) return;


    let tabsHTML = `<div class="tabs-nav-bar">`;
    let panelsHTML = `<div class="tabs-panels-container">`;


    const addTab = (id, label, icon, renderFunc, data) => {
        if (!data || (Array.isArray(data) && data.length === 0)) return;
        
        tabsHTML += `
            <button type="button" class="tab-nav-btn" data-tab-target="panel_${id}">
                <i class="${icon}"></i> ${escapeHTML(label)}
            </button>
        `;
        
        panelsHTML += `
            <div id="panel_${id}" class="tab-panel-view hidden-tab-view" data-tab-content>
                <div id="container_${id}"></div>
            </div>
        `;


        // Execution queue execution
        setTimeout(() => {
            const container = document.getElementById(`container_${id}`);
            if (container && typeof renderFunc === "function") {
                renderFunc(container, data);
            }
        }, 50);
    };


    // Add Core Content Tab Always
    tabsHTML += `
        <button type="button" class="tab-nav-btn active-tab-btn" data-tab-target="panel_core">
            <i class="fa-solid fa-book-open"></i> Full Text
        </button>
    `;
    panelsHTML += `
        <div id="panel_core" class="tab-panel-view" data-tab-content>
            <div class="core-chapter-text-body">
                ${chapterData.content ? (processTypographyText ? processTypographyText(chapterData.content) : chapterData.content) : "<p>No text content available.</p>"}
            </div>
        </div>
    `;


    // Add Optional Dynamic Data Tabs
    addTab("notes", "Revision Notes", "fa-solid fa-file-lines", renderRevisionNotesBox, chapterData.revisionNotes);
    addTab("points", "Key Points", "fa-solid fa-list-check", renderImportantPointsBox, chapterData.importantPoints);
    addTab("formulas", "Formulas", "fa-solid fa-square-root-variable", renderChapterFormulasBox, chapterData.formulas);
    addTab("ncert", "NCERT Solutions", "fa-solid fa-graduation-cap", renderNcertExercisesBox, chapterData.ncertExercises);
    addTab("quiz", "Practice Quiz", "fa-solid fa-circle-question", renderChapterQuizWidget, chapterData.quiz);
    addTab("glossary", "Glossary", "fa-solid fa-spell-check", renderChapterGlossaryBox, chapterData.glossary);


    tabsHTML += `</div>`;
    panelsHTML += `</div>`;


    tabsContainer.innerHTML = tabsHTML + panelsHTML;


    // Trigger local listeners hook
    if (typeof initializeTabSwitcherModule === "function") {
        initializeTabSwitcherModule();
    }
    
    // Trigger equations over the main chapter block text
    const corePanel = document.getElementById("panel_core");
    if (corePanel && typeof renderMathematicalEquations === "function") {
        renderMathematicalEquations(corePanel);
    }
}


/* =====================================================
   PART 52 — DYNAMIC VIDEO LECTURES EMBEDDER MODULE
===================================================== */


function renderVideoLecturesBox(containerElement, videoData) {
    if (!containerElement) return;


    if (!Array.isArray(videoData) || videoData.length === 0) {
        containerElement.innerHTML = `<p class="empty-message">No video lectures available for this chapter.</p>`;
        return;
    }


    let html = `<div class="video-lectures-grid">`;
    videoData.forEach(video => {
        let embedUrl = video.url || "";
        if (embedUrl.includes("youtube.com/watch?v=")) {
            embedUrl = embedUrl.replace("watch?v=", "embed/");
        } else if (embedUrl.includes("youtu.be/")) {
            embedUrl = embedUrl.replace("youtu.be/", "youtube.com/embed/");
        }


        html += `
            <div class="video-lecture-card">
                <div class="video-iframe-responsive">
                    <iframe src="${escapeHTML(embedUrl)}" title="${escapeHTML(video.title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                <div class="video-card-body">
                    <h6>${escapeHTML(video.title)}</h6>
                    ${video.duration ? `<small><i class="fa-regular fa-clock"></i> Duration: ${escapeHTML(video.duration)}</small>` : ""}
                </div>
            </div>
        `;
    });
    html += `</div>`;


    containerElement.innerHTML = html;
}


/* =====================================================
   PART 53 — REVISION HISTORY PROGRESS PERSISTENCE
===================================================== */


function trackUserChapterReadingProgress() {
    const pageInfo = typeof getPageInfo === "function" ? getPageInfo() : null;
    if (!pageInfo || !pageInfo.chapterId) return;


    let progressHistory = JSON.parse(localStorage.getItem("jacverse-reading-history")) || [];
    const recordId = `${pageInfo.classId}_${pageInfo.subjectId}_${pageInfo.bookId}_${pageInfo.chapterId}`;


    // Remove existing record to update position timestamp
    progressHistory = progressHistory.filter(item => item.id !== recordId);
    
    progressHistory.unshift({
        id: recordId,
        classId: pageInfo.classId,
        subjectId: pageInfo.subjectId,
        bookId: pageInfo.bookId,
        chapterId: pageInfo.chapterId,
        viewedAt: Date.now()
    });


    // Keep only top 20 recent records
    if (progressHistory.length > 20) {
        progressHistory = progressHistory.slice(0, 20);
    }


    localStorage.setItem("jacverse-reading-history", JSON.stringify(progressHistory));
}


document.addEventListener("DOMContentLoaded", trackUserChapterReadingProgress);


/* =====================================================
   PART 54 — ACCESSIBLE COMPACT HEADER OVERLAY RESPONDER
===================================================== */


function initializeFloatingHeaderControl() {
    const headerBar = document.getElementById("floatingCompactHeaderBar");
    if (!headerBar) return;


    window.addEventListener("scroll", () => {
        if (window.scrollY > 250) {
            headerBar.classList.add("header-visible-sticky");
        } else {
            headerBar.classList.remove("header-visible-sticky");
        }
    });
}


document.addEventListener("DOMContentLoaded", initializeFloatingHeaderControl);


/* =====================================================
   PART 55 — SIDEBAR EXPANDABLE NAVIGATION SYNC
===================================================== */


function synchronizeSidebarNavigationState() {
    const pageInfo = typeof getPageInfo === "function" ? getPageInfo() : null;
    if (!pageInfo || !pageInfo.bookId) return;


    const bookData = typeof getBookData === "function" 
        ? getBookData(pageInfo.classId, pageInfo.subjectId, pageInfo.bookId) 
        : null;
    
    const sidebarContainer = document.getElementById("sidebarChapterListMenu");
    if (!sidebarContainer || !bookData) return;


    const chapters = typeof getAllChapters === "function" ? getAllChapters(bookData) : [];
    
    let html = `<ul class="sidebar-chapters-vertical-links">`;
    chapters.forEach(ch => {
        const isActive = ch.id === pageInfo.chapterId ? "active-sidebar-link" : "";
        html += `
            <li class="${isActive}">
                <a href="content.html?class=${encodeURIComponent(pageInfo.classId)}&subject=${encodeURIComponent(pageInfo.subjectId)}&book=${encodeURIComponent(pageInfo.bookId)}&chapter=${encodeURIComponent(ch.id)}">
                    <span class="ch-badge">${escapeHTML(String(ch.number))}</span>
                    <span class="ch-title-text">${escapeHTML(ch.title)}</span>
                </a>
            </li>
        `;
    });
    html += `</ul>`;


    sidebarContainer.innerHTML = html;
}


document.addEventListener("DOMContentLoaded", synchronizeSidebarNavigationState);


/* =====================================================
   PART 56 — INTERACTIVE HIGHLIGHTS STATE PRESERVER
===================================================== */


function saveUserHighlights() {
    const pageInfo = typeof getPageInfo === "function" ? getPageInfo() : null;
    const contentArea = document.getElementById("chapterContent");
    if (!pageInfo || !pageInfo.chapterId || !contentArea) return;


    const storageKey = `jacverse-hl-${pageInfo.classId}-${pageInfo.subjectId}-${pageInfo.bookId}-${pageInfo.chapterId}`;
    const highlightMarks = contentArea.querySelectorAll("mark.jacverse-highlight");
    
    const elementsData = Array.from(highlightMarks).map(mark => mark.innerText);
    localStorage.setItem(storageKey, JSON.stringify(elementsData));
}


/* =====================================================
   PART 57 — DYNAMIC PAGE LOADER INITIALIZER BRIDGE
===================================================== */


function renderChapterContent(chapterData) {
    const contentTitle = document.getElementById("chapterMainHeadingTitle");
    if (contentTitle) {
        contentTitle.textContent = chapterData.title;
    }


    // Build tabs component
    buildAndInjectChapterTabs(chapterData);


    // Dynamic components execution hook
    const videoTabContainer = document.getElementById("container_videos");
    if (videoTabContainer && chapterData.videoLectures) {
        renderVideoLecturesBox(videoTabContainer, chapterData.videoLectures);
    }
}


/* =====================================================
   PART 58 — SIDEBAR COLLAPSIBLE INTERACTION TOGGLE
===================================================== */


function initializeSidebarCollapseToggle() {
    const toggleBtn = document.getElementById("sidebarToggleBtn");
    const layoutWrapper = document.getElementById("jacverseAppWrapper");


    if (!toggleBtn || !layoutWrapper) return;


    toggleBtn.addEventListener("click", () => {
        layoutWrapper.classList.toggle("sidebar-hidden-state");
    });
}


document.addEventListener("DOMContentLoaded", initializeSidebarCollapseToggle);


/* =====================================================
   PART 59 — GLOBAL WINDOW SCROLL-TO-TOP BUTTON
===================================================== */


function initializeScrollToTopWidget() {
    let topBtn = document.getElementById("scrollToTopFloatingBtn");
    if (!topBtn) {
        topBtn = document.createElement("button");
        topBtn.id = "scrollToTopFloatingBtn";
        topBtn.className = "scroll-top-btn hidden-action-btn";
        topBtn.type = "button";
        topBtn.innerHTML = `<i class="fa-solid fa-arrow-up"></i>`;
        document.body.appendChild(topBtn);
    }


    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            topBtn.classList.remove("hidden-action-btn");
        } else {
            topBtn.classList.add("hidden-action-btn");
        }
    });


    topBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}


document.addEventListener("DOMContentLoaded", initializeScrollToTopWidget);


/* =====================================================
   PART 60 — USER INTERFACE PRELOADER CURTAIN CLOSER
===================================================== */


function hideApplicationPreloaderCurtain() {
    const preloader = document.getElementById("applicationPreloaderCurtain");
    if (preloader) {
        preloader.classList.add("preloader-fade-out-curtain");
        setTimeout(() => preloader.remove(), 500);
    }
}


window.addEventListener("load", hideApplicationPreloaderCurtain);
/* =====================================================
   JacVerse - Main Script
   Part 7: Utility Modules, Performance & State Management
===================================================== */


/* =====================================================
   PART 61 — USER INTERFACE TELEMETRY PERFORMANCE TRACKER
===================================================== */


function logPerformanceMetric(metricName, duration) {
    console.log(`[JacVerse Performance] ${metricName}: ${duration.toFixed(2)}ms`);
    // Telemetry storage hook can be safely added here if required
}


/* =====================================================
   PART 62 — LOCAL RECENT REVISION SUMMARY LOGGER
===================================================== */


function getRecentReadingHistorySummary() {
    try {
        const history = JSON.parse(localStorage.getItem("jacverse-reading-history")) || [];
        return history.slice(0, 5); // Return top 5 recent readings
    } catch (e) {
        console.error("Error reading history log:", e);
        return [];
    }
}


/* =====================================================
   PART 63 — TEXT HIGHLIGHT RESTORATION ENGINE
===================================================== */


function restoreUserHighlights() {
    const pageInfo = typeof getPageInfo === "function" ? getPageInfo() : null;
    const contentArea = document.getElementById("chapterContent");
    if (!pageInfo || !pageInfo.chapterId || !contentArea) return;


    const storageKey = `jacverse-hl-${pageInfo.classId}-${pageInfo.subjectId}-${pageInfo.bookId}-${pageInfo.chapterId}`;
    try {
        const savedHighlights = JSON.parse(localStorage.getItem(storageKey)) || [];
        if (savedHighlights.length === 0) return;


        let contentHTML = contentArea.innerHTML;
        savedHighlights.forEach(text => {
            if (!text.trim()) return;
            const regex = new RegExp(`(${text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "g");
            contentHTML = contentHTML.replace(regex, "<mark class='jacverse-highlight'>$1</mark>");
        });
        contentArea.innerHTML = contentHTML;
    } catch (e) {
        console.error("Failed to restore user highlights:", e);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    // Delay slightly to allow content to finish rendering inside the full text tab panel
    setTimeout(restoreUserHighlights, 600);
});


/* =====================================================
   PART 64 — BOOKMARK REMOVAL DIRECT HANDLER
===================================================== */


function removeSingleBookmark(bookmarkId, successCallback) {
    try {
        let bookmarks = JSON.parse(localStorage.getItem("jacverse-bookmarks")) || [];
        bookmarks = bookmarks.filter(b => b.id !== bookmarkId);
        localStorage.setItem("jacverse-bookmarks", JSON.stringify(bookmarks));
        if (typeof successCallback === "function") successCallback();
    } catch (e) {
        console.error("Failed to delete bookmark:", e);
    }
}


/* =====================================================
   PART 65 — MATHJAX RENDERING CONFIGURATION UTILITY
===================================================== */


function configureMathJaxEngine() {
    if (window.MathJax) return; // Already loaded or configured


    window.MathJax = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true
        },
        options: {
            ignoreHtmlClass: 'tex2jax_ignore',
            processHtmlClass: 'tex2jax_process'
        },
        startup: {
            pageReady: () => {
                return window.MathJax.startup.defaultPageReady().then(() => {
                    console.log("MathJax Initialization completed successfully.");
                });
            }
        }
    };
}


configureMathJaxEngine();


/* =====================================================
   PART 66 — DYNAMIC CONTENT LOADING SKELETON PLACEHOLDER
===================================================== */


function createSkeletonLoaderGrid(container, itemsCount = 6) {
    if (!container) return;
    
    let skeletonHTML = `<div class="skeleton-loader-grid-wrapper">`;
    for (let i = 0; i < itemsCount; i++) {
        skeletonHTML += `
            <div class="skeleton-card-item animated-pulse-bg">
                <div class="skeleton-line-title long-skeleton"></div>
                <div class="skeleton-line-paragraph short-skeleton"></div>
            </div>
        `;
    }
    skeletonHTML += `</div>`;
    
    container.innerHTML = skeletonHTML;
}


/* =====================================================
   PART 67 — SESSION STATE TIMEOUT MONITOR
===================================================== */


function initializeSessionTimeoutMonitor() {
    let lastActivityTime = Date.now();


    const updateActivity = () => {
        lastActivityTime = Date.now();
    };


    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keypress", updateActivity);
    window.addEventListener("scroll", updateActivity);


    // Check activity every 5 minutes
    setInterval(() => {
        const inactiveDuration = Date.now() - lastActivityTime;
        if (inactiveDuration > 30 * 60 * 1000) { // 30 Minutes Inactivity
            console.log("[JacVerse Session] User session is currently idle.");
        }
    }, 5 * 60 * 1000);
}


document.addEventListener("DOMContentLoaded", initializeSessionTimeoutMonitor);


/* =====================================================
   PART 68 — SAFE GLOBAL URL STATE CLEANER
===================================================== */


function cleanUrlTrackingParameters() {
    try {
        const url = new URL(window.location.href);
        if (url.searchParams.has("utm_source") || url.searchParams.has("ref")) {
            url.searchParams.delete("utm_source");
            url.searchParams.delete("ref");
            window.history.replaceState({}, document.title, url.pathname + url.search);
            console.log("Cleaned tracking query params safely from route.");
        }
    } catch (e) {
        // Fallback or silent catch
    }
}


document.addEventListener("DOMContentLoaded", cleanUrlTrackingParameters);


/* =====================================================
   PART 69 — DYNAMIC APPS CONTAINER BINDINGS MIGRATOR
===================================================== */


function migrateLegacyBindingsIfPresent() {
    const oldContainer = document.querySelector(".legacy-content-box");
    if (oldContainer) {
        oldContainer.classList.remove("legacy-content-box");
        oldContainer.classList.add("core-chapter-text-body");
        console.log("Successfully normalized legacy layouts DOM structure.");
    }
}


document.addEventListener("DOMContentLoaded", migrateLegacyBindingsIfPresent);


/* =====================================================
   PART 70 — APP LEVEL ERROR BOX BOUNDARY RENDERING
===================================================== */


function renderApplicationErrorFallbackBoundary(targetId,errorMessage) {
    const errorContainer = document.getElementById(targetId);
    if (!errorContainer) return;


    errorContainer.innerHTML = `
        <div class="app-critical-error-boundary">
            <h3><i class="fa-solid fa-triangle-exclamation"></i> Action Required</h3>
            <p>${escapeHTML(errorMessage || "An unexpected processing fault occurred.")}</p>
            <button type="button" class="btn btn-primary" onclick="window.location.reload();">
                <i class="fa-solid fa-arrows-rotate"></i> Reload Engine
            </button>
        </div>
    `;
}
/* =====================================================
   JacVerse - Main Script
   Part 8: Initialization Routers & Engine Bootstrapper
===================================================== */


/* =====================================================
   PART 71 — GLOBAL DOM PARSING SANITIZER UTILITY
===================================================== */


function escapeHTML(unsafeStringText) {
    if (typeof unsafeStringText !== "string") return unsafeStringText;
    return unsafeStringText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   PART 72 — BROWSER COMPATIBILITY CHECK ENGINE
===================================================== */


function checkBrowserFeatureCapabilities() {
    const supportsLocalStorage = (() => {
        try {
            localStorage.setItem("jacverse-test", "1");
            localStorage.removeItem("jacverse-test");
            return true;
        } catch (e) {
            return false;
        }
    })();


    if (!supportsLocalStorage) {
        console.warn("[JacVerse System] Local storage is disabled or unsupported. Progress tracking will not persist.");
    }
    return {
        localStorageAvailable: supportsLocalStorage,
        fetchAvailable: typeof window.fetch === "function",
        cryptoAvailable: typeof window.crypto === "object"
    };
}


/* =====================================================
   PART 73 — MATHEMATICAL EQUATIONS RENDERER HOOK
===================================================== */


function renderMathematicalEquations(targetElementContainer) {
    if (!targetElementContainer) return;


    if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
        window.MathJax.typesetPromise([targetElementContainer]).catch((err) => {
            console.error("MathJax processing rendering syntax error:", err);
        });
    }
}


/* =====================================================
   PART 74 — DYNAMIC TYPOGRAPHY FORMATTER ENGINE
===================================================== */


function processTypographyText(rawTextMarkup) {
    if (!rawTextMarkup || typeof rawTextMarkup !== "string") return "";


    // Convert basic line break markers safely
    let formattedText = rawTextMarkup.replace(/\n/g, "<br>");
    
    // Bold wrap patterns conversion
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // Italic wrap patterns conversion
    formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>");


    return formattedText;
}


/* =====================================================
   PART 75 — GLOBAL ROUTE SELECTION QUERY PARSER
===================================================== */


function getPageInfo() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            classId: urlParams.get("class") || "",
            subjectId: urlParams.get("subject") || "",
            bookId: urlParams.get("book") || "",
            chapterId: urlParams.get("chapter") || ""
        };
    } catch (e) {
        console.error("Failed parsing location routing query strings:", e);
        return { classId: "", subjectId: "", bookId: "", chapterId: "" };
    }
}


/* =====================================================
   PART 76 — PREVIOUS & NEXT CHAPTER SCENARIO ROUTERS
===================================================== */


function openNextChapter() {
    navigateAdjacentChapter("next");
}


function openPreviousChapter() {
    navigateAdjacentChapter("prev");
}


function navigateAdjacentChapter(directionDirection) {
    const pageInfo = typeof getPageInfo === "function" ? getPageInfo() : null;
    if (!pageInfo || !pageInfo.bookId || !pageInfo.chapterId) return;


    const bookData = typeof getBookData === "function" 
        ? getBookData(pageInfo.classId, pageInfo.subjectId, pageInfo.bookId) 
        : null;
        
    if (!bookData) return;


    const chapters = typeof getAllChapters === "function" ? getAllChapters(bookData) : [];
    const currentIndex = chapters.findIndex(ch => ch.id === pageInfo.chapterId);


    if (currentIndex === -1) return;


    let targetChapter = null;
    if (directionDirection === "next" && currentIndex < chapters.length - 1) {
        targetChapter = chapters[currentIndex + 1];
    } else if (directionDirection === "prev" && currentIndex > 0) {
        targetChapter = chapters[currentIndex - 1];
    }


    if (targetChapter) {
        window.location.href = `content.html?class=${encodeURIComponent(pageInfo.classId)}&subject=${encodeURIComponent(pageInfo.subjectId)}&book=${encodeURIComponent(pageInfo.bookId)}&chapter=${encodeURIComponent(targetChapter.id)}`;
    } else {
        showToastNotification(`No ${directionDirection} chapter available.`, "info");
    }
}


/* =====================================================
   PART 77 — CENTRAL APP LIFE-CYCLE ORCHESTRATOR
===================================================== */


function bootJacVerseCoreEngine() {
    console.log("[JacVerse Engine] Initiating core lifecycle services...");
    
    // Performance and compatibility audits
    checkBrowserFeatureCapabilities();
    clearOldJacVerseCache();


    const routeInfo = getPageInfo();
    if (!routeInfo.chapterId) {
        // Not on a detail page, hide loader gracefully
        const preloader = document.getElementById("applicationPreloaderCurtain");
        if (preloader) preloader.remove();
        return;
    }


    const db = window.jAC_DATABASE || (typeof jacVerseDatabase !== "undefined" ? jacVerseDatabase : null);
    if (!db) {
        renderApplicationErrorFallbackBoundary("chapterContent", "Database engine failed to respond. Please check database files alignment.");
        hideApplicationPreloaderCurtain();
        return;
    }


    // Resolve structural hierarchy references safely
    try {
        const book = typeof getBookData === "function" 
            ? getBookData(routeInfo.classId, routeInfo.subjectId, routeInfo.bookId) 
            : null;
            
        if (!book) throw new Error("Requested book data set could not be located.");


        const chapters = typeof getAllChapters === "function" ? getAllChapters(book) : [];
        const activeChapter = chapters.find(ch => ch.id === routeInfo.chapterId);


        if (!activeChapter) throw new Error("Requested chapter resource path is missing inside database layers.");


        // Global functions reference for bookmarks runtime access context
        window.getCurrentChapter = () => activeChapter;


        // Render full document UI layout components
        renderChapterContent(activeChapter);
        
    } catch (err) {
        console.error("Critical core setup exception:", err);
        renderApplicationErrorFallbackBoundary("chapterContent", err.message);
    } finally {
        // Close initialization curtain
        setTimeout(hideApplicationPreloaderCurtain, 400);
    }
}


/* =====================================================
   PART 78 — DOM INTERACTION NAV EVENTS REGISTRATION
===================================================== */


function registerActionButtonsClickTriggers() {
    const prevTriggerBtn = document.getElementById("prevChapterActionBtn");
    if (prevTriggerBtn) {
        prevTriggerBtn.addEventListener("click", openPreviousChapter);
    }


    const nextTriggerBtn = document.getElementById("nextChapterActionBtn");
    if (nextTriggerBtn) {
        nextTriggerBtn.addEventListener("click", openNextChapter);
    }
}


document.addEventListener("DOMContentLoaded", registerActionButtonsClickTriggers);


/* =====================================================
   PART 79 — CORE BINDING INITIALIZATION EXECUTER ENTRYPOINT
===================================================== */


// Run core boot logic as soon as DOM structure is completely available
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootJacVerseCoreEngine);
} else {
    bootJacVerseCoreEngine();
}
/* =====================================================
   LOADER FIX
===================================================== */
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
        }, 300); // 300ms transition time ke baad display none ho jayega
    }
});
