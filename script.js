/**
 * S. Santhosh - Portfolio Script Controller
 * Features:
 * - Dynamic data injection from portfolio-data.js
 * - Canvas-based interactive Antigravity Particles
 * - Typist effect for title rotating roles
 * - Scroll spy active link updates
 * - Scroll reveal animations using Intersection Observer
 * - Responsive mobile nav drawer toggle
 * - Interactive contact form handling
 */

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. DATA INJECTION ENGINE
    // ----------------------------------------------------
    try {
        if (typeof PORTFOLIO_DATA !== 'undefined') {
            injectPortfolioData(PORTFOLIO_DATA);
        } else {
            console.error("PORTFOLIO_DATA is not defined. Check portfolio-data.js load.");
        }
    } catch (e) {
        console.error("Error injecting portfolio data: ", e);
    }

    // ----------------------------------------------------
    // 2. ANTIGRAVITY PARTICLE CANVAS BACKGROUND
    // ----------------------------------------------------
    initAntigravityParticles();

    // ----------------------------------------------------
    // 3. AUTO-TYPING HERO CAROUSEL
    // ----------------------------------------------------
    if (typeof PORTFOLIO_DATA !== 'undefined' && PORTFOLIO_DATA.profile.taglines) {
        initTypingCarousel(PORTFOLIO_DATA.profile.taglines);
    }

    // ----------------------------------------------------
    // 4. HEADER NAVIGATION CONTROL & MOB DRAW
    // ----------------------------------------------------
    initNavigation();

    // ----------------------------------------------------
    // 5. SCROLL OBSERVER & REVEAL SYSTEM
    // ----------------------------------------------------
    initScrollReveal();

    // ----------------------------------------------------
    // 6. CONTACT FORM SYSTEM
    // ----------------------------------------------------
    initContactForm();
});

/**
 * Renders data dynamically from configuration file to HTML zones
 */
function injectPortfolioData(data) {
    const p = data.profile;

    // Header logo & title
    const logoLink = document.getElementById("logo-link");
    if (logoLink && p.name) {
        const shortName = p.name.split(" ").pop() || p.name;
        logoLink.innerHTML = `<span class="logo-accent">&lt;</span>${shortName}<span class="logo-accent"> /&gt;</span>`;
    }

    // Hero Section Injection
    const heroName = document.getElementById("profile-name");
    const heroTagline = document.getElementById("profile-tagline");
    const heroResumeBtn = document.getElementById("hero-resume-btn");
    
    if (heroName) heroName.textContent = p.name;
    if (heroTagline) heroTagline.textContent = p.tagline;
    if (heroResumeBtn && p.resumeUrl) heroResumeBtn.setAttribute("href", p.resumeUrl);

    // About Me Injection
    const abYears = document.getElementById("about-years");
    const abCgpa = document.getElementById("about-cgpa");
    const abCollege = document.getElementById("about-college");
    const abEmail = document.getElementById("about-email");
    const abPhone = document.getElementById("about-phone");
    const abDesc = document.getElementById("about-description");
    const abResumeBtn = document.getElementById("about-resume-btn");

    if (abYears && p.years) abYears.textContent = p.years;
    if (abCgpa && p.cgpa) abCgpa.textContent = p.cgpa;
    if (abCollege && p.collegeName) abCollege.textContent = p.collegeName;
    if (abEmail && p.email) abEmail.innerHTML = `<a href="mailto:${p.email}">${p.email}</a>`;
    if (abPhone && p.phone) abPhone.textContent = p.phone;
    if (abDesc && p.about) abDesc.textContent = p.about;
    if (abResumeBtn && p.resumeUrl) abResumeBtn.setAttribute("href", p.resumeUrl);

    // Skills Injection
    const skillsContainer = document.getElementById("skills-container");
    if (skillsContainer && data.skills) {
        skillsContainer.innerHTML = ""; // Clear loader
        data.skills.forEach(category => {
            const card = document.createElement("div");
            card.className = "skills-category-card glass-card scroll-reveal";
            
            let skillsListHTML = "";
            category.items.forEach(skill => {
                skillsListHTML += `
                    <div class="skill-badge" style="--skill-color: ${skill.color || 'var(--accent-cyan)'}">
                        <div class="skill-icon-wrap" style="color: ${skill.color || 'var(--accent-cyan)'}">
                            <i class="${skill.iconClass}"></i>
                        </div>
                        <span class="skill-name">${skill.name}</span>
                    </div>
                `;
            });

            card.innerHTML = `
                <h3 class="category-title">${category.category}</h3>
                <div class="skills-grid">
                    ${skillsListHTML}
                </div>
            `;
            skillsContainer.appendChild(card);
        });
    }

    // Projects Injection
    const projectsGrid = document.getElementById("projects-grid");
    if (projectsGrid && data.projects) {
        projectsGrid.innerHTML = ""; // Clear loader
        data.projects.forEach(project => {
            const card = document.createElement("div");
            card.className = "project-card glass-card scroll-reveal";

            let featuresHTML = "";
            if (project.features) {
                project.features.forEach(feat => {
                    featuresHTML += `<li><i class="fa-solid fa-arrow-right"></i>${feat}</li>`;
                });
            }

            let techHTML = "";
            if (project.technologies) {
                project.technologies.forEach(tech => {
                    techHTML += `<span class="tech-tag">${tech}</span>`;
                });
            }

            let liveLinkHTML = project.liveLink 
                ? `<a href="${project.liveLink}" class="project-link-btn" target="_blank" aria-label="View Live Project"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` 
                : "";

            card.innerHTML = `
                <div class="project-top">
                    <div class="project-icon-row">
                        <i class="fa-regular fa-folder-open project-folder-icon"></i>
                        <div class="project-links">
                            <a href="${project.githubLink || '#'}" class="project-link-btn" target="_blank" aria-label="GitHub Repository"><i class="fa-brands fa-github"></i></a>
                            ${liveLinkHTML}
                        </div>
                    </div>
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-desc">${project.description}</p>
                    <ul class="project-features-list">
                        ${featuresHTML}
                    </ul>
                </div>
                <div class="project-tech-tags">
                    ${techHTML}
                </div>
            `;
            projectsGrid.appendChild(card);
        });
    }

    // Education Timeline Injection
    const timeline = document.getElementById("education-timeline");
    if (timeline && data.education) {
        timeline.innerHTML = ""; // Clear loader
        data.education.forEach(edu => {
            const item = document.createElement("div");
            item.className = "timeline-item scroll-reveal";
            item.innerHTML = `
                <div class="timeline-node">
                    <div class="timeline-node-inner"></div>
                </div>
                <div class="timeline-card">
                    <div class="timeline-header">
                        <h3 class="timeline-degree">${edu.degree}</h3>
                        <span class="timeline-duration">${edu.duration}</span>
                    </div>
                    <div class="timeline-institution">${edu.institution}</div>
                    <div class="timeline-score">${edu.scoreType}: ${edu.score}</div>
                    <p class="timeline-desc">${edu.description}</p>
                </div>
            `;
            timeline.appendChild(item);
        });
    }

    // Certifications Injection
    const certGrid = document.getElementById("certifications-grid");
    if (certGrid && data.certifications) {
        certGrid.innerHTML = ""; // Clear loader
        data.certifications.forEach(cert => {
            const card = document.createElement("div");
            card.className = "cert-card glass-card scroll-reveal";
            card.innerHTML = `
                <div class="cert-top">
                    <i class="fa-solid fa-award cert-badge-icon"></i>
                    <h3 class="cert-title">${cert.title}</h3>
                    <div class="cert-org">${cert.organization}</div>
                    <div class="cert-date">${cert.date}</div>
                    <p class="cert-desc">${cert.description}</p>
                </div>
                <div class="cert-bottom">
                    <a href="${cert.fileUrl || '#'}" class="btn btn-secondary cert-btn" target="_blank">
                        <i class="fa-solid fa-up-right-from-square icon-left"></i>View Credentials
                    </a>
                </div>
            `;
            certGrid.appendChild(card);
        });
    }

    // Achievements Injection
    const achievementsGrid = document.getElementById("achievements-grid");
    if (achievementsGrid && data.achievements) {
        achievementsGrid.innerHTML = ""; // Clear loader
        data.achievements.forEach(ach => {
            const card = document.createElement("div");
            card.className = "achievement-card glass-card scroll-reveal";
            card.innerHTML = `
                <div class="achievement-header">
                    <h3 class="achievement-title">${ach.title}</h3>
                    <span class="achievement-date">${ach.date}</span>
                </div>
                <div class="achievement-org">${ach.organization}</div>
                <p class="achievement-desc">${ach.description}</p>
            `;
            achievementsGrid.appendChild(card);
        });
    }

    // Contact & Footer Links Injection
    const contactEmail = document.getElementById("contact-email");
    const contactPhone = document.getElementById("contact-phone");
    const contactLinkedin = document.getElementById("contact-linkedin");
    const contactGithub = document.getElementById("contact-github");
    const footerLinkedin = document.getElementById("footer-linkedin");
    const footerGithub = document.getElementById("footer-github");
    const copyrightYear = document.getElementById("copyright-year");

    if (contactEmail && p.email) contactEmail.innerHTML = `<a href="mailto:${p.email}">${p.email}</a>`;
    if (contactPhone && p.phone) contactPhone.textContent = p.phone;
    if (contactLinkedin && p.linkedin) contactLinkedin.setAttribute("href", p.linkedin);
    if (contactGithub && p.github) contactGithub.setAttribute("href", p.github);
    if (footerLinkedin && p.linkedin) footerLinkedin.setAttribute("href", p.linkedin);
    if (footerGithub && p.github) footerGithub.setAttribute("href", p.github);
    
    if (copyrightYear) {
        const currentYear = new Date().getFullYear();
        copyrightYear.textContent = currentYear;
    }
}

/**
 * Floating space dust particle simulation reacting to mouse gravity
 */
function initAntigravityParticles() {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let particles = [];
    const maxParticles = 65;
    
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(isInitial = false) {
            this.x = Math.random() * canvas.width;
            // If initial, scatter across canvas; if rising, start from bottom
            this.y = isInitial ? Math.random() * canvas.height : canvas.height + 10;
            this.size = Math.random() * 2.2 + 0.5;
            this.baseSpeedY = -(Math.random() * 0.4 + 0.2); // Rise upwards (antigravity)
            this.speedY = this.baseSpeedY;
            this.speedX = Math.random() * 0.4 - 0.2; // Slight drift left/right
            this.opacity = Math.random() * 0.4 + 0.1;
            this.glowColor = Math.random() > 0.5 ? '0, 242, 254' : '161, 0, 255'; // Cyan or Purple
        }

        update() {
            // Apply mouse physical interaction (push away)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.hypot(dx, dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Push particles away from cursor
                    const pushX = (dx / distance) * force * 2.5;
                    const pushY = (dy / distance) * force * 2.5;

                    this.x -= pushX;
                    this.y -= pushY;
                }
            }

            // Normal drifting movement
            this.y += this.speedY;
            this.x += this.speedX;

            // Recirculate particle if it exits the top or sides
            if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                this.reset(false);
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.glowColor}, ${this.opacity})`;
            ctx.shadowBlur = this.size * 2;
            ctx.shadowColor = `rgba(${this.glowColor}, 0.5)`;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow for efficiency
        }
    }

    function setupCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function init() {
        setupCanvasSize();
        particles = [];
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", () => {
        setupCanvasSize();
    });

    init();
    animate();
}

/**
 * Setup rotating role list with typist animations
 */
function initTypingCarousel(words) {
    const textSpan = document.getElementById("typing-text");
    if (!textSpan) return;

    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    const typeSpeed = 90;
    const eraseSpeed = 45;
    const waitDelay = 2200; // Hold role visual

    function type() {
        const currentWord = words[wordIdx];
        
        if (isDeleting) {
            textSpan.textContent = currentWord.substring(0, charIdx - 1);
            charIdx--;
        } else {
            textSpan.textContent = currentWord.substring(0, charIdx + 1);
            charIdx++;
        }

        let currentSpeed = isDeleting ? eraseSpeed : typeSpeed;

        if (!isDeleting && charIdx === currentWord.length) {
            currentSpeed = waitDelay;
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            currentSpeed = 300; // Pause before typing next role
        }

        setTimeout(type, currentSpeed);
    }

    setTimeout(type, 500);
}

/**
 * Handle sticky navigation styles, mobile toggles, and active section highlighting
 */
function initNavigation() {
    const header = document.getElementById("header");
    const navMenu = document.getElementById("nav-menu");
    const toggleBtn = document.getElementById("nav-toggle-btn");
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section");

    // Sticky Scroll shrink header
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        scrollSpy();
    });

    // Mobile Toggle drawer
    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener("click", () => {
            const isActive = navMenu.classList.toggle("active");
            toggleBtn.classList.toggle("active");
            toggleBtn.setAttribute("aria-expanded", isActive);
        });
    }

    // Close menu when clicking nav item
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (navMenu.classList.contains("active")) {
                navMenu.classList.remove("active");
                toggleBtn.classList.remove("active");
                toggleBtn.setAttribute("aria-expanded", "false");
            }
        });
    });

    // Active Scroll Spy: Highlights nav headers based on viewport scroll
    function scrollSpy() {
        let scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; // Nav padding offset
            const sectionId = current.getAttribute("id");
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-menu a[href*='${sectionId}']`)?.classList.add("active");
            } else {
                document.querySelector(`.nav-menu a[href*='${sectionId}']`)?.classList.remove("active");
            }
        });
    }
}

/**
 * Fade-in scroll animations using intersection observer
 */
function initScrollReveal() {
    // Select elements to reveal
    const reveals = document.querySelectorAll(".scroll-reveal");
    
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px" // Triggers slightly before element enters viewport
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    observer.unobserve(entry.target); // Unwatch once revealed
                }
            });
        }, observerOptions);

        reveals.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers without IntersectionObserver support
        reveals.forEach(el => el.classList.add("revealed"));
    }
}

/**
 * Simple contact form feedback mock handler
 */
function initContactForm() {
    const form = document.getElementById("contact-form");
    const statusMsg = document.getElementById("form-status");
    const submitBtn = document.getElementById("form-submit-btn");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Show loading state
        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector("span");
        const origText = btnText.textContent;
        btnText.textContent = "Sending...";
        
        // Mocking API call/Email processing
        setTimeout(() => {
            // Success response
            statusMsg.className = "form-status success";
            statusMsg.textContent = "Thank you! Your message has been sent successfully. S. Santhosh will get back to you soon.";
            
            // Reset form
            form.reset();
            submitBtn.disabled = false;
            btnText.textContent = origText;

            // Hide status message after 6 seconds
            setTimeout(() => {
                statusMsg.style.display = "none";
            }, 6000);
        }, 1500);
    });
}
