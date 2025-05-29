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
                    const experienceSectionDelay = 0.2; 
                    if (!prefersReducedMotion) {
                        section.style.animation = `contentSectionAppear 0.8s ease-out forwards ${experienceSectionDelay}s`;
                        const experienceItems = section.querySelectorAll('.experience-item-card'); 
                        
                        experienceItems.forEach((item, itemIndex) => {
                            item.style.opacity = '0';
                            const cardBaseDelay = experienceSectionDelay + 0.5 + (itemIndex * 0.15); 
                            item.style.animation = `cardEntrance 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards ${cardBaseDelay}s`; 
                            
                            const titleElement = item.querySelector('h4');
                            const listItemElements = item.querySelectorAll('ul li');
                            let contentDelay = cardBaseDelay + 0.3; 

                            if (titleElement) {
                                titleElement.style.opacity = '0'; 
                                titleElement.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentDelay}s`;
                                contentDelay += 0.15; 
                            }

                            listItemElements.forEach((li, liIndex) => {
                                li.style.opacity = '0'; 
                                li.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentDelay + (liIndex * 0.1)}s`;
                            });
                        });
                    } else {
                        section.style.opacity = '1';
                        const experienceItems = section.querySelectorAll('.experience-item-card');
                        experienceItems.forEach(item => {
                            item.style.opacity = '1';
                            const titleElement = item.querySelector('h4');
                            if (titleElement) titleElement.style.opacity = '1';
                            item.querySelectorAll('ul li').forEach(li => li.style.opacity = '1');
                        });
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
                    const sectionAppearDelay = (section.id === 'education') ? 0.2 : 0; 
                    
                    if (!prefersReducedMotion) {
                        section.style.animation = `contentSectionAppear 1s ease-out forwards ${sectionAppearDelay}s`;
                        const innerCards = section.querySelectorAll('.content-card'); 
                        
                        innerCards.forEach((card, cardIndex) => {
                            card.style.opacity = '0';
                            const cardBaseAnimationDelay = sectionAppearDelay + 0.4 + (cardIndex * 0.2); 
                            card.style.animation = `cardEntrance 0.7s ease-out forwards ${cardBaseAnimationDelay}s`;

                            let contentAnimDelay = cardBaseAnimationDelay + 0.3;
                            
                            // For #education section cards
                            if (section.id === 'education') {
                                const titleElement = card.querySelector('h4');
                                if (titleElement) {
                                    titleElement.style.opacity = '0';
                                    titleElement.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay}s`;
                                    contentAnimDelay += 0.15;
                                }
                                // For .education-details-card <p>
                                const paragraphElement = card.querySelector('.education-details-card p');
                                if (paragraphElement) {
                                    paragraphElement.style.opacity = '0';
                                    paragraphElement.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay}s`;
                                    contentAnimDelay += 0.15;
                                }
                                // For .certifications-list-card <ul><li>
                                const listItemElements = card.querySelectorAll('.certifications-list-card ul li');
                                if (listItemElements.length > 0) {
                                    listItemElements.forEach((li, liIndex) => {
                                        li.style.opacity = '0';
                                        li.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay + (liIndex * 0.1)}s`;
                                    });
                                }
                            } 
                            // For #contact section card
                            else if (section.id === 'contact' && card.classList.contains('connect-with-me-card')) {
                                const titleElement = card.querySelector('h2'); // Contact card uses h2
                                const paragraphElement = card.querySelector('p');
                                const buttonListItems = card.querySelectorAll('ul li');

                                if (titleElement) {
                                    titleElement.style.opacity = '0';
                                    titleElement.style.animation = `revealTextCascade 0.5s ease-out forwards ${contentAnimDelay}s`;
                                    contentAnimDelay += 0.15;
                                }
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
                            const titleElementH4 = card.querySelector('h4');
                            if (titleElementH4) titleElementH4.style.opacity = '1';
                            const paragraphElement = card.querySelector('p');
                            if (paragraphElement) paragraphElement.style.opacity = '1';
                            const titleElementH2 = card.querySelector('h2');
                            if (titleElementH2) titleElementH2.style.opacity = '1';
                            card.querySelectorAll('ul li').forEach(li => li.style.opacity = '1');
                        });
                    }
                    sectionAnimationApplied = true;
                }

                if (!sectionAnimationApplied && section.style.animation === '' && !prefersReducedMotion) { 
                    section.style.animation = 'refinedFadeInSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
                } else if (prefersReducedMotion && section.style.animation !== '') { 
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
