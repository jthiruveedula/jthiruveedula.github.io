'use strict';

export function initThemeToggle() {
    const themeToggleButton = document.getElementById('theme-toggle');
    const bodyElement = document.body;

    const applyTheme = (theme) => {
        if (theme === 'light') {
            bodyElement.classList.add('light-mode');
        } else {
            bodyElement.classList.remove('light-mode');
        }
    };

    // Respect user's OS preference if no theme is stored in localStorage
    let currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            currentTheme = 'light';
        } else {
            currentTheme = 'dark';
        }
    }

    applyTheme(currentTheme);

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            bodyElement.classList.toggle('light-mode');
            if (bodyElement.classList.contains('light-mode')) {
                currentTheme = 'light';
            } else {
                currentTheme = 'dark';
            }
            localStorage.setItem('theme', currentTheme);
        });
    }
}

export function initContactForm() {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (form && formStatus) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const action = form.action;

            // Display pending status (optional)
            formStatus.textContent = 'Sending...';
            formStatus.className = 'form-status pending'; // Add a class for pending if you want specific styles
            formStatus.style.display = 'block';

            try {
                const response = await fetch(action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.textContent = 'Message sent successfully! Thanks for reaching out.';
                    formStatus.className = 'form-status success';
                    form.reset(); // Clear the form
                } else {
                    // Try to get error message from response if available (some services provide it)
                    const data = await response.json().catch(() => null); // Catch if response isn't JSON
                    if (data && data.error) {
                        formStatus.textContent = `Error: ${data.error}`;
                    } else {
                        formStatus.textContent = 'Oops! There was a problem submitting your form. Please try again later.';
                    }
                    formStatus.className = 'form-status error';
                }
            } catch (error) {
                console.error('Form submission error:', error);
                formStatus.textContent = 'Oops! An unexpected error occurred. Please try again later.';
                formStatus.className = 'form-status error';
            }

            // Make status visible (if not already handled by adding class)
            formStatus.style.display = 'block';
        });
    }
}

export function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
            // Optional: Add class to body to prevent scrolling when menu is open
            // document.body.classList.toggle('no-scroll', isExpanded);
        });

        // Close mobile menu when a link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    // document.body.classList.remove('no-scroll');
                }
            });
        });
    }

    // Active link highlighting
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('header nav ul li a');

    if (sections.length > 0 && navLinks.length > 0) {
        const observerOptions = {
            root: null, // relative to document viewport
            rootMargin: '-50% 0px -50% 0px', // Trigger when section is in middle of viewport
            threshold: 0 // Trigger if any part of section is visible within rootMargin
        };

        const activateLink = (id) => {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        };

        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    activateLink(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });

        // Set initial active link on page load (e.g. for #about if no hash)
        // Or if there's a hash in the URL
        let initialSectionId = 'about'; // Default
        if (window.location.hash) {
            const hashId = window.location.hash.substring(1);
            if (document.getElementById(hashId)) {
                initialSectionId = hashId;
            }
        }
        activateLink(initialSectionId);
         // Also, ensure the correct section is scrolled into view if a hash is present,
        // after initial animations might have settled.
        if (window.location.hash) {
            setTimeout(() => {
                const targetElement = document.getElementById(window.location.hash.substring(1));
                if (targetElement) {
                    // targetElement.scrollIntoView({ behavior: 'smooth' }); // This might be too aggressive with other scroll effects
                }
            }, 500); // Delay to allow other JS to settle
        }
    }
}


export function initScrollToTop() {
    const scrollTopButton = document.querySelector('.scroll-to-top');
    if (scrollTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopButton.classList.add('visible');
            } else {
                scrollTopButton.classList.remove('visible');
            }
        });
        scrollTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
