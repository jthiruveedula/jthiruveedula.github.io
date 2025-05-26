document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('main section'); // Target all sections

    // Remove the CSS-driven animation if JS is active, to prevent double animation
    // and to give control to Intersection Observer
    animatedElements.forEach(el => {
        el.style.opacity = '0'; // Keep them initially hidden by JS
        el.style.animation = 'none'; // Disable CSS animation
    });

    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInSlideUp 0.7s ease-out forwards';
                // entry.target.classList.add('is-visible'); // Or add a class to trigger animation
                observerInstance.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
        // rootMargin: '0px 0px -50px 0px' // Optional: adjust when animation triggers
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // --- Theme Toggle Functionality ---
    const themeToggle = document.getElementById('theme-toggle');
    const toggleText = document.querySelector('.theme-toggle-label .toggle-text');
    const body = document.body;

    // Function to set theme
    function setTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-theme');
            themeToggle.checked = true;
            toggleText.textContent = 'Light Mode'; // Update text for dark mode
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            themeToggle.checked = false;
            toggleText.textContent = 'Dark Mode'; // Update text for light mode
            localStorage.setItem('theme', 'light');
        }
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        setTheme(true);
    } else {
        setTheme(false); // Default to light if no preference or preference is light
    }

    // Event listener for toggle
    themeToggle.addEventListener('change', () => {
        setTheme(themeToggle.checked);
    });
});
