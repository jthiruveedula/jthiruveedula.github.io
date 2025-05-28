'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('main section');

    sections.forEach(section => {
        section.style.opacity = '0'; // Initially hide main sections. Inner elements' opacity handled by observer.
    });

    const sectionObserver = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;

                if (section.id === 'skills') {
                    section.style.opacity = '1'; // Make the #skills section container visible

                    const categoryHeadings = section.querySelectorAll('h3');
                    let headingAnimationDelay = 0; // Initial delay for the first heading

                    categoryHeadings.forEach((heading, index) => {
                        heading.style.opacity = '0'; // Prepare for animation
                        setTimeout(() => {
                            heading.classList.add('animate-slide-left');
                        }, headingAnimationDelay + (index * 150)); // Stagger category headings
                    });
                    
                    // Calculate delay for chips to start after all headings have started animating
                    // Assumes animate-slide-left is 0.7s (700ms). A slight overlap or gap can be adjusted here.
                    // Let's say headings take about 700ms + (numHeadings-1)*150ms to mostly complete.
                    let chipAnimationBaseDelay = (categoryHeadings.length > 0) ? (150 * (categoryHeadings.length -1) + 700 * 0.5 ) : 0; // Start chips roughly when headings are half-way through their animation.
                                                                                                                                    // Adjusted to 0.5 of animation duration for earlier start.

                    const skillLists = section.querySelectorAll('.skills-list');
                    
                    skillLists.forEach((list) => {
                        const chips = list.querySelectorAll('li.skill-chip');
                        chips.forEach((chip, chipIndex) => {
                            chip.style.opacity = '0'; // Prepare for animation
                            setTimeout(() => {
                                chip.classList.add('animate-scale-up');
                            }, chipAnimationBaseDelay + (chipIndex * 80)); // Stagger chips within the current list
                        });
                        // Increment base delay for the next list's chips, ensuring they start after the current list's chips
                        chipAnimationBaseDelay += chips.length * 80; 
                    });

                    observerInstance.unobserve(section); // Unobserve after initiating animations

                } else {
                    // Existing generic animation logic for other sections
                    section.style.animation = 'refinedFadeInSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
                    
                    const elementsToStagger = section.querySelectorAll('#experience article > ul > li, #projects .project-card'); 
                    
                    elementsToStagger.forEach((el, index) => {
                        el.style.opacity = '0'; // Ensure hidden before animation
                        el.style.animation = `refinedFadeInSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards ${index * 0.1 + 0.3}s`;
                    });
                    observerInstance.unobserve(section);
                }
            }
        });
    }, {
        threshold: 0.15 // Trigger when 15% of the section is visible
    });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
});
