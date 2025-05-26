'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('main section');

    sections.forEach(section => {
        section.style.opacity = '0'; // Initially hide sections
        // Check for specific elements within sections to stagger
        const elementsToStagger = section.querySelectorAll('.skills-list > li, #experience article > ul > li, #projects > article'); 
        // Also hide these initially if they are to be staggered
        elementsToStagger.forEach(el => el.style.opacity = '0');
    });

    const sectionObserver = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                // Animate the section itself
                section.style.animation = 'refinedFadeInSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
                
                // Find elements within this section to stagger
                const elementsToStagger = section.querySelectorAll('.skills-list > li, #experience article > ul > li, #projects > article');
                
                elementsToStagger.forEach((el, index) => {
                    el.style.animation = `refinedFadeInSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards ${index * 0.1 + 0.3}s`; // 0.3s base delay + 0.1s stagger
                });

                observerInstance.unobserve(section); // Stop observing the section
            }
        });
    }, {
        threshold: 0.15 // Trigger when 15% of the section is visible
    });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
});
