'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Name animation logic
    const nameElement = document.querySelector('.animated-name');
    if (nameElement) {
        const chars = Array.from(nameElement.children); 
        chars.forEach(char => {
            if (!char.classList.contains('space')) { 
                char.style.opacity = '0';
            }
        });
        chars.forEach((char, index) => {
            // MODIFIED: Changed cubic-bezier for a less aggressive bounce
            char.style.animation = `fadeSlideUpLetter 0.7s cubic-bezier(0.25, 0.8, 0.25, 1) forwards ${index * 0.05 + 0.2}s`;
        });
    }

    // Tagline pill animation logic
    const taglinePills = document.querySelectorAll('.tagline-pill');
    if (taglinePills.length > 0) {
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!prefersReducedMotion) {
            taglinePills.forEach((pill, index) => {
                // MODIFIED: Increased base delay for pills
                pill.style.animation = `pillEntrance 0.5s ease-out forwards ${index * 0.1 + 0.8}s`; 
            });
        } else {
            taglinePills.forEach(pill => {
                pill.style.opacity = '1';
            });
        }
    }

    // IntersectionObserver setup for sections
    const sections = document.querySelectorAll('main section');

    sections.forEach(section => {
        // Initially hide sections that will be animated by the observer
        // CSS handles opacity for reduced motion cases.
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            section.style.opacity = '0'; 
        } else {
            section.style.opacity = '1'; // Ensure sections are visible if motion is reduced
        }
    });

    const sectionObserver = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

                // Make section visible before animation starts (if not already visible due to reduced motion)
                if (!prefersReducedMotion) {
                    section.style.opacity = '1'; 
                }


                let sectionAnimationApplied = false;

                if (section.id === 'skills') {
                    const categoryHeadings = section.querySelectorAll('h3');
                    const skillChips = section.querySelectorAll('.skills-list li.skill-chip');
                    
                    if (!prefersReducedMotion) {
                        categoryHeadings.forEach(h => h.style.opacity = '0');
                        skillChips.forEach(c => c.style.opacity = '0'); 
                    } else {
                        categoryHeadings.forEach(h => h.style.opacity = '1');
                        skillChips.forEach(c => c.style.opacity = '1');
                    }
                    
                    const skillCategoryHeadings = section.querySelectorAll('h3');
                    let headingAnimationDelay = 0; 

                    skillCategoryHeadings.forEach((heading, index) => {
                        if (!prefersReducedMotion) {
                           setTimeout(() => {
                               heading.classList.add('animate-slide-left');
                           }, headingAnimationDelay + (index * 150));
                        }
                    });
                    
                    let chipAnimationBaseDelay = (skillCategoryHeadings.length > 0 && !prefersReducedMotion) ? (150 * (skillCategoryHeadings.length -1) + 350 ) : 0; 

                    const skillLists = section.querySelectorAll('.skills-list');
                    skillLists.forEach((list) => {
                        const chips = list.querySelectorAll('li.skill-chip');
                        chips.forEach((chip, chipIndex) => {
                            if (!prefersReducedMotion) {
                                setTimeout(() => {
                                    chip.classList.add('animate-scale-up');
                                }, chipAnimationBaseDelay + (chipIndex * 80)); 
                            }
                        });
                        if (!prefersReducedMotion) {
                            chipAnimationBaseDelay += chips.length * 80; 
                        }
                    });
                    sectionAnimationApplied = true; 

                } else if (section.id === 'about') {
                    if (!prefersReducedMotion) {
                        section.style.animation = 'contentSectionAppear 0.8s ease-out forwards';
                        const paragraphs = section.querySelectorAll('.about-me-card p');
                        paragraphs.forEach((p, index) => {
                            p.style.opacity = '0'; 
                            p.style.animation = `revealTextCascade 0.7s ease-out forwards ${index * 0.2 + 0.4}s`; 
                        });
                    } else {
                        section.style.opacity = '1'; 
                        const paragraphs = section.querySelectorAll('.about-me-card p');
                        paragraphs.forEach(p => p.style.opacity = '1');
                    }
                    sectionAnimationApplied = true;

                } else if (section.id === 'experience') {
                     if (!prefersReducedMotion) {
                        section.style.animation = 'contentSectionAppear 0.8s ease-out forwards';
                        // MODIFIED: Corrected selector for experienceItems
                        const experienceItems = section.querySelectorAll('.experience-item-card'); 
                        experienceItems.forEach((item, index) => {
                            item.style.opacity = '0'; 
                            item.style.animation = `cardEntrance 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards ${index * 0.15 + 0.5}s`; 
                        });
                    } else {
                        section.style.opacity = '1';
                        // MODIFIED: Corrected selector for experienceItems
                        const experienceItems = section.querySelectorAll('.experience-item-card');
                        experienceItems.forEach(item => item.style.opacity = '1');
                    }
                    sectionAnimationApplied = true;

                } else if (section.id === 'projects') {
                    if (!prefersReducedMotion) {
                        section.style.animation = 'contentSectionAppear 0.8s ease-out forwards';
                        const projectCards = section.querySelectorAll('.project-card');
                        projectCards.forEach((card, index) => {
                            card.style.opacity = '0'; 
                            card.style.animation = `cardEntrance 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards ${index * 0.15 + 0.5}s`; 
                        });
                    } else {
                        section.style.opacity = '1';
                        const projectCards = section.querySelectorAll('.project-card');
                        projectCards.forEach(card => card.style.opacity = '1');
                    }
                    sectionAnimationApplied = true;

                } else if (section.id === 'education' || section.id === 'contact') {
                    if (!prefersReducedMotion) {
                        section.style.animation = `contentSectionAppear 1s ease-out forwards`;
                        const innerCards = section.querySelectorAll('.content-card, .project-card'); 
                        if (innerCards.length > 0) {
                            innerCards.forEach((card, index) => {
                                card.style.opacity = '0';
                                card.style.animation = `cardEntrance 0.7s ease-out forwards ${index * 0.2 + 0.4}s`; 
                            });
                        }
                    } else {
                        section.style.opacity = '1';
                        const innerCards = section.querySelectorAll('.content-card, .project-card');
                        innerCards.forEach(card => card.style.opacity = '1');
                    }
                    sectionAnimationApplied = true;
                }

                if (!sectionAnimationApplied && section.style.animation === '' && !prefersReducedMotion) { 
                    section.style.animation = 'refinedFadeInSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
                } else if (prefersReducedMotion && section.style.animation !== '') { // Ensure to clear animation if one was accidentally set
                    section.style.animation = 'none';
                }
                
                observerInstance.unobserve(section);
            }
        });
    }, {
        threshold: 0.1 
    });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

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
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const headerElement = document.querySelector('header');
    const animatedNameElement = document.querySelector('.animated-name');

    if (headerElement && animatedNameElement) {
        const chars = Array.from(animatedNameElement.children);
        const maxRotate = 8; 

        headerElement.addEventListener('mousemove', (e) => {
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                chars.forEach(char => {
                    const charStyle = window.getComputedStyle(char);
                    if (parseFloat(charStyle.opacity) > 0.95) { 
                        char.style.transform = 'translateY(0px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
                    }
                });
                return; 
            }

            const rect = headerElement.getBoundingClientRect();
            const mouseX = e.clientX - rect.left; 
            const mouseY = e.clientY - rect.top;  

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const deltaX = (mouseX - centerX) / centerX; 
            const deltaY = (mouseY - centerY) / centerY; 

            const rotateY = deltaX * maxRotate; 
            const rotateX = -deltaY * maxRotate; 

            chars.forEach(char => {
                const charStyle = window.getComputedStyle(char);
                if (parseFloat(charStyle.opacity) > 0.95) { 
                    char.style.transform = `translateY(0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px)`;
                }
            });
        });

        headerElement.addEventListener('mouseleave', () => {
            chars.forEach(char => {
                const charStyle = window.getComputedStyle(char);
                if (parseFloat(charStyle.opacity) > 0.95) {
                    char.style.transform = `translateY(0px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
                }
            });
        });
    }
});
