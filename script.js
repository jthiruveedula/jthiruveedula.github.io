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
            if (section.id !== 'experience') {
                section.style.opacity = '0';
            } else {
                // Ensure the #experience section container itself is visible,
                // as its children (timeline-item) will be animated individually.
                section.style.opacity = '1';
            }
        } else {
            section.style.opacity = '1'; // All sections visible if reduced motion
        }
    });

    const sectionObserver = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
                    let chipAnimationBaseDelay = (skillCategoryHeadings.length > 0 && !prefersReducedMotion) ? (150 * (skillCategoryHeadings.length - 1) + 350) : 0;
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
                } else if (section.id === 'projects') { // Experience section animation removed
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
                                const titleElement = card.querySelector('h3'); // Corrected from h4
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
                                // const titleElement = card.querySelector('h2'); // h2 is outside card now
                                const paragraphElement = card.querySelector('p'); // This p might not exist anymore
                                const buttonListItems = card.querySelectorAll('ul li');
                                // if (titleElement) {
                                // titleElement.style.opacity = '0';
                                // titleElement.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay}s`;
                                // contentAnimDelay += 0.15;
                                // }
                                if (paragraphElement) {
                                    paragraphElement.style.opacity = '0';
                                    paragraphElement.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay}s`;
                                    contentAnimDelay += 0.15;
                                }
                                buttonListItems.forEach((li, liIndex) => {
                                    li.style.opacity = '0';
                                    li.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay + (liIndex * 0.1)}s`;
                                });
                            }
                        });
                    } else {
                        section.style.opacity = '1';
                        const innerCards = section.querySelectorAll('.content-card');
                        innerCards.forEach(card => {
                            card.style.opacity = '1';
                            const titleElementH3 = card.querySelector('h3'); // Corrected from h4
                            if (titleElementH3) titleElementH3.style.opacity = '1';
                            const paragraphElement = card.querySelector('p');
                            if (paragraphElement) paragraphElement.style.opacity = '1';
                            // const titleElementH2 = card.querySelector('h2');
                            // if (titleElementH2) titleElementH2.style.opacity = '1';
                            card.querySelectorAll('ul li').forEach(li => li.style.opacity = '1');
                        });
                    }
                    sectionAnimationApplied = true;
                }

                if (!sectionAnimationApplied && section.style.animation === '' && !prefersReducedMotion && section.id !== 'experience') { // Do not apply generic animation to experience section
                    section.style.animation = 'refinedFadeInSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
                } else if (prefersReducedMotion && section.style.animation !== '') {
                    section.style.animation = 'none';
                }
                observerInstance.unobserve(section);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        if (section.id !== 'experience') { // Exclude experience section from main observer if it will be handled by timelineObserver
            sectionObserver.observe(section);
        }
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

    // Timeline items animation
    const timelineItems = document.querySelectorAll('#experience .timeline-item');
    if (timelineItems.length > 0) {
        const prefersReducedMotionQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
        const isReducedMotion = prefersReducedMotionQuery.matches;

        if (isReducedMotion) {
            timelineItems.forEach(item => {
                item.style.opacity = '1'; // Ensure visible if motion is reduced
                item.classList.remove('animate-in'); // Redundant if CSS handles it but safe
            });
        } else { // Only set up observer if motion is not reduced
            const timelineObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry, index) => { // index here is for entries array, not global timeline item index
                    if (entry.isIntersecting) {
                        const item = entry.target;
                        // Stagger based on the actual DOM order of the item, not the 'entries' index
                        const itemIndex = Array.from(timelineItems).indexOf(item);
                        setTimeout(() => {
                            item.classList.add('animate-in');
                            // item.style.opacity = '1'; // CSS .animate-in should handle this
                        }, itemIndex * 150); // Stagger delay
                        observer.unobserve(item);
                    }
                });
            }, {
                threshold: 0.2, // Trigger when 20% of the item is visible
            });

            timelineItems.forEach(item => {
                // CSS should set initial opacity to 0 for items to be animated via .timeline-item rule
                timelineObserver.observe(item);
            });
        }
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
