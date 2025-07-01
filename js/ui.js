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
