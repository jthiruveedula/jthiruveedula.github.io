'use strict';
document.addEventListener('DOMContentLoaded', () => {
    const nameElement = document.querySelector('.animated-name');
    if (nameElement) {
        const chars = Array.from(nameElement.children);
        chars.forEach(char => {
            if (!char.classList.contains('space')) {
                char.style.opacity = '0';
            }
        });
        chars.forEach((char, index) => {
            char.style.animation = `fadeSlideUpLetter 0.7s cubic-bezier(0.25, 0.8, 0.25, 1) forwards ${index * 0.05 + 0.2}s`;
        });
    }

    const taglinePills = document.querySelectorAll('.tagline-pill');
    if (taglinePills.length > 0) {
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            taglinePills.forEach((pill, index) => {
                pill.style.animation = `pillEntrance 0.5s ease-out forwards ${index * 0.1 + 0.8}s`;
            });
        } else {
            taglinePills.forEach(pill => {
                pill.style.opacity = '1';
            });
        }
    }

    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            if (section.id !== 'experience') { // Keep #experience section visible
                section.style.opacity = '0';
            } else {
                section.style.opacity = '1'; // Ensure #experience itself is visible
            }
        } else {
            section.style.opacity = '1';
        }
    });

    const sectionObserver = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                
                // Ensure section is visible if not reduced motion (unless it's experience, which is already visible)
                if (!prefersReducedMotion && section.id !== 'experience') {
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
                        // Opacity already set by initial loop for reduced motion
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
                        // Opacity already set
                    }
                    sectionAnimationApplied = true;
                } else if (section.id === 'education' || section.id === 'contact') {
                    const sectionAppearDelay = (section.id === 'education') ? 0.2 : 0;
                    if (!prefersReducedMotion) {
                        section.style.animation = `contentSectionAppear 1s ease-out forwards ${sectionAppearDelay}s`;
                        const innerCards = section.querySelectorAll('.content-card');
                        innerCards.forEach((card, cardIndex) => {
                            card.style.opacity = '0';
                            const cardBaseAnimationDelay = sectionAppearDelay + 0.4 + (cardIndex * 0.2);
                            card.style.animation = `cardEntrance 0.7s ease-out forwards ${cardBaseAnimationDelay}s`;
                            let contentAnimDelay = cardBaseAnimationDelay + 0.3;
                            if (section.id === 'education') {
                                const titleElement = card.querySelector('h3');
                                if (titleElement) {
                                    titleElement.style.opacity = '0';
                                    titleElement.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay}s`;
                                    contentAnimDelay += 0.15;
                                }
                                const paragraphElement = card.querySelector('.education-details-card p');
                                if (paragraphElement) {
                                    paragraphElement.style.opacity = '0';
                                    paragraphElement.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay}s`;
                                    contentAnimDelay += 0.15;
                                }
                                const listItemElements = card.querySelectorAll('.certifications-list-card ul li');
                                if (listItemElements.length > 0) {
                                    listItemElements.forEach((li, liIndex) => {
                                        li.style.opacity = '0';
                                        li.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay + (liIndex * 0.1)}s`;
                                    });
                                }
                            } else if (section.id === 'contact' && card.classList.contains('connect-with-me-card')) {
                                const buttonListItems = card.querySelectorAll('ul li');
                                buttonListItems.forEach((li, liIndex) => {
                                    li.style.opacity = '0';
                                    li.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay + (liIndex * 0.1)}s`;
                                });
                            }
                        });
                    } else {
                        // Opacity already set
                    }
                    sectionAnimationApplied = true;
                }

                if (!sectionAnimationApplied && section.id !== 'experience' && section.style.animation === '' && !prefersReducedMotion) {
                    section.style.animation = 'refinedFadeInSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
                } else if (prefersReducedMotion && section.style.animation !== '') {
                    section.style.animation = 'none';
                }
                observerInstance.unobserve(section);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        // #experience section's direct animation is not handled by sectionObserver anymore.
        // Its children (.timeline-item) will be handled by timelineObserver.
        if (section.id !== 'experience') { 
            sectionObserver.observe(section);
        }
    });
    
    // Timeline items animation
    const timelineItems = document.querySelectorAll('#experience .timeline-item');
    if (timelineItems.length > 0) {
        const prefersReducedMotionQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
        const isReducedMotion = prefersReducedMotionQuery.matches;

        if (isReducedMotion) {
            // CSS already handles making timeline items visible if reduced motion is preferred
        } else { 
            const timelineObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => { 
                    if (entry.isIntersecting) {
                        const item = entry.target;
                        const itemIndex = Array.from(timelineItems).indexOf(item); // Get index for stagger
                        setTimeout(() => {
                            item.classList.add('animate-in');
                        }, itemIndex * 150); 
                        observer.unobserve(item);
                    }
                });
            }, {
                threshold: 0.2, 
            });

            timelineItems.forEach(item => {
                timelineObserver.observe(item);
            });
        }
    }

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

const themeToggleButton = document.getElementById('theme-toggle');
const bodyElement = document.body;
const applyTheme = (theme) => {
    if (theme === 'light') {
        bodyElement.classList.add('light-mode');
    } else {
        bodyElement.classList.remove('light-mode');
    }
};
let currentTheme = localStorage.getItem('theme') || 'dark';
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
