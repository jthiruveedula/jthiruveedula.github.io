'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Name animation logic
    const nameElement = document.querySelector('.animated-name');
    if (nameElement) {
        const chars = Array.from(nameElement.children); // Get direct children spans
        // Set initial opacity to 0 via JS just before animating
        chars.forEach(char => {
            if (!char.classList.contains('space')) { // Don't hide spaces if they shouldn't be animated
                char.style.opacity = '0';
            }
        });
        chars.forEach((char, index) => {
            // Initial state for transform is set by CSS (.animated-name .char)
            // Trigger animation by setting animation property
            // (index * 50ms stagger) + (200ms initial delay for the whole animation to start)
            char.style.animation = `fadeSlideUpLetter 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards ${index * 0.05 + 0.2}s`;
        });
    }

    // Existing IntersectionObserver setup for sections
    const sections = document.querySelectorAll('main section');

    sections.forEach(section => {
        section.style.opacity = '0'; // Initially hide main sections. Inner elements' opacity handled by observer.
    });

    const sectionObserver = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                section.style.opacity = '1'; // Make section visible before animation starts

                let sectionAnimationApplied = false;

                if (section.id === 'skills') {
                    // Skills section has its own complex animation, keep it as is.
                    // Make sure its elements are initially hidden if not already handled.
                    const categoryHeadings = section.querySelectorAll('h3');
                    categoryHeadings.forEach(h => h.style.opacity = h.style.opacity || '0');
                    const skillChips = section.querySelectorAll('.skills-list li.skill-chip');
                    skillChips.forEach(c => c.style.opacity = c.style.opacity || '0');
                    
                    // Original skills animation logic (simplified for brevity, assuming it's self-contained)
                    const skillCategoryHeadings = section.querySelectorAll('h3');
                    let headingAnimationDelay = 0; 

                    skillCategoryHeadings.forEach((heading, index) => {
                        setTimeout(() => {
                            heading.classList.add('animate-slide-left');
                        }, headingAnimationDelay + (index * 150)); 
                    });
                    
                    let chipAnimationBaseDelay = (skillCategoryHeadings.length > 0) ? (150 * (skillCategoryHeadings.length -1) + 350 ) : 0; 

                    const skillLists = section.querySelectorAll('.skills-list');
                    skillLists.forEach((list) => {
                        const chips = list.querySelectorAll('li.skill-chip');
                        chips.forEach((chip, chipIndex) => {
                            setTimeout(() => {
                                chip.classList.add('animate-scale-up');
                            }, chipAnimationBaseDelay + (chipIndex * 80)); 
                        });
                        chipAnimationBaseDelay += chips.length * 80; 
                    });
                    sectionAnimationApplied = true; // Mark as handled

                } else if (section.id === 'about') {
                    section.style.animation = 'contentSectionAppear 0.8s ease-out forwards';
                    const paragraphs = section.querySelectorAll('.about-me-card p');
                    paragraphs.forEach((p, index) => {
                        p.style.opacity = '0'; // Prepare for animation
                        p.style.animation = `revealTextCascade 0.7s ease-out forwards ${index * 0.2 + 0.4}s`; // Added 0.4s delay for section to appear first
                    });
                    sectionAnimationApplied = true;

                } else if (section.id === 'experience') {
                    section.style.animation = 'contentSectionAppear 0.8s ease-out forwards';
                    const experienceItems = section.querySelectorAll('article.experience-item-card'); // Assuming each job is an article.experience-item-card
                    experienceItems.forEach((item, index) => {
                        item.style.opacity = '0'; // Prepare for animation
                        item.style.animation = `cardEntrance 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards ${index * 0.15 + 0.5}s`; // Added 0.5s delay
                    });
                    sectionAnimationApplied = true;

                } else if (section.id === 'projects') {
                    section.style.animation = 'contentSectionAppear 0.8s ease-out forwards';
                    const projectCards = section.querySelectorAll('.project-card');
                    projectCards.forEach((card, index) => {
                        card.style.opacity = '0'; // Prepare for animation
                        card.style.animation = `cardEntrance 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards ${index * 0.15 + 0.5}s`; // Added 0.5s delay
                    });
                    sectionAnimationApplied = true;

                } else if (section.id === 'education' || section.id === 'contact') {
                    section.style.animation = `contentSectionAppear 1s ease-out forwards`;
                    // If these sections have multiple cards that need individual animation:
                    const innerCards = section.querySelectorAll('.content-card, .project-card'); // General catch for cards if any
                    if (innerCards.length > 0) {
                        innerCards.forEach((card, index) => {
                            card.style.opacity = '0';
                            // Using cardEntrance for consistency, but could be contentSectionAppear too
                            card.style.animation = `cardEntrance 0.7s ease-out forwards ${index * 0.2 + 0.4}s`; // Staggered if multiple cards
                        });
                    }
                    sectionAnimationApplied = true;
                }

                // Fallback for any other sections not explicitly handled, if necessary
                if (!sectionAnimationApplied && section.style.animation === '') { // Check if no animation was applied
                    section.style.animation = 'refinedFadeInSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
                }
                
                observerInstance.unobserve(section);
            }
        });
    }, {
        threshold: 0.1 // Changed to 0.1 for earlier trigger
    });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Scroll-to-top button logic
    const scrollTopButton = document.querySelector('.scroll-to-top');

    if (scrollTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) { // Show button after scrolling 300px
                scrollTopButton.classList.add('visible');
            } else {
                scrollTopButton.classList.remove('visible');
            }
        });

        scrollTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Interactive Header (Name tilt effect)
    const headerElement = document.querySelector('header');
    const animatedNameElement = document.querySelector('.animated-name');

    if (headerElement && animatedNameElement) {
        const chars = Array.from(animatedNameElement.children);
        const maxRotate = 5; // Max rotation in degrees

        headerElement.addEventListener('mousemove', (e) => {
            // Check for prefers-reduced-motion
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                // If reduced motion is preferred, ensure characters are reset and do not animate with mouse
                chars.forEach(char => {
                    const charStyle = window.getComputedStyle(char);
                    // Ensure opacity check is consistent with entry animation completion
                    if (parseFloat(charStyle.opacity) > 0.95) { 
                        char.style.transform = 'translateY(0px) rotate(0deg) rotateX(0deg) rotateY(0deg)';
                    }
                });
                return; // Exit the mousemove handler early
            }

            const rect = headerElement.getBoundingClientRect();
            const mouseX = e.clientX - rect.left; // Mouse X relative to header
            const mouseY = e.clientY - rect.top;  // Mouse Y relative to header

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const deltaX = (mouseX - centerX) / centerX; // Normalized (-1 to 1)
            const deltaY = (mouseY - centerY) / centerY; // Normalized (-1 to 1)

            const rotateY = deltaX * maxRotate; // RotateY based on mouseX
            const rotateX = -deltaY * maxRotate; // RotateX based on mouseY (inverted)

            chars.forEach(char => {
                // Check if the entry animation is complete.
                const charStyle = window.getComputedStyle(char);
                if (parseFloat(charStyle.opacity) > 0.95) { // Ensure entry animation has made it visible
                    // Preserve the original Y translation and rotation from the entry animation's 'to' state.
                    // Then, add the mouse-based rotation.
                    char.style.transform = `translateY(0px) rotate(0deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                }
            });
        });

        // Optional: Reset to default state when mouse leaves the header
        headerElement.addEventListener('mouseleave', () => {
            chars.forEach(char => {
                const charStyle = window.getComputedStyle(char);
                if (parseFloat(charStyle.opacity) > 0.95) {
                    char.style.transform = `translateY(0px) rotate(0deg) rotateX(0deg) rotateY(0deg)`;
                }
            });
        });
    }
});
