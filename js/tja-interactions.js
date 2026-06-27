document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. DYNAMIC CUSTOM CURSOR (WITH LERP TRAILS)
    // ==========================================
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'tja-cursor-dot';
    ring.className = 'tja-cursor-ring';
    dot.id = 'tja-dot';
    ring.id = 'tja-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let isMoving = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
        isMoving = true;
    });

    // Smooth trailing interpolation (LERP)
    function animateCursor() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Toggle hover classes for links & buttons
    const hoverables = document.querySelectorAll('a, button, .problem-card, .program-card, input, textarea');
    hoverables.forEach(item => {
        item.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        item.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });


    // ==========================================
    // 2. HERO INTERACTIVE PARTICLE CANVAS
    // ==========================================
    const canvas = document.getElementById('hero-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const maxParticles = 45;
        
        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.4 - 0.2;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Bounce off edges
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.fillStyle = `rgba(108, 191, 243, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 85) {
                        ctx.strokeStyle = `rgba(108, 191, 243, ${0.15 - (dist / 85) * 0.15})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(drawParticles);
        }
        drawParticles();
    }
    
    // ==========================================
    // 2.5 TEXT SCRAMBLE REVEAL EFFECT
    // ==========================================
    const scrambleElements = document.querySelectorAll('.tja-scramble');
    const chars = 'TJA10!@#$%^&*()_+<>?~[]{}|ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    function scrambleText(element) {
        const originalText = element.getAttribute('data-original') || element.innerText;
        element.setAttribute('data-original', originalText);
        let iterations = 0;
        
        const interval = setInterval(() => {
            element.innerText = originalText.split('')
                .map((letter, index) => {
                    if(index < iterations) return originalText[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('');
                
            if(iterations >= originalText.length) {
                clearInterval(interval);
                element.innerText = originalText;
            }
            iterations += 1 / 3;
        }, 30);
    }
    
    // Run scramble on load
    scrambleElements.forEach(el => scrambleText(el));
    
    // ==========================================
    // 3. 3D DYNAMIC TILT EFFECT (FOR CARDS)
    // ==========================================
    const tiltCards = document.querySelectorAll('.problem-card, .program-card, .hero-glass-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Mouse relative position inside card (-0.5 to 0.5)
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            // Maximum tilt angle (8 degrees)
            const maxTilt = 8;
            card.style.setProperty('--tilt-rx', `${-y * maxTilt}deg`);
            card.style.setProperty('--tilt-ry', `${x * maxTilt}deg`);

            // Also set spotlight glow coordinates
            const glowX = e.clientX - rect.left;
            const glowY = e.clientY - rect.top;
            card.style.setProperty('--glow-x', `${glowX}px`);
            card.style.setProperty('--glow-y', `${glowY}px`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--tilt-rx', `0deg`);
            card.style.setProperty('--tilt-ry', `0deg`);
        });
    });


    // ==========================================
    // 4. SCROLL REVEAL (INTERSECTION OBSERVER)
    // ==========================================
    const revealElements = document.querySelectorAll('.tja-reveal');
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('tja-revealed');
                // Unobserve once revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));


    // ==========================================
    // 5. HERO FLOATING SHAPES PARALLAX
    // ==========================================
    const heroSection = document.querySelector('.hero-section');
    const floatingShapes = document.querySelectorAll('.floating-shape');
    
    if (heroSection && floatingShapes.length > 0) {
        heroSection.addEventListener('mousemove', (e) => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const mouseX = (e.clientX / width) - 0.5;
            const mouseY = (e.clientY / height) - 0.5;
            
            floatingShapes.forEach((shape, index) => {
                const depthMultiplier = (index + 1) * 35; 
                const translateX = mouseX * depthMultiplier;
                const translateY = mouseY * depthMultiplier;
                shape.style.transform = `translate(${translateX}px, ${translateY}px)`;
            });
        });

        heroSection.addEventListener('mouseleave', () => {
            floatingShapes.forEach((shape) => {
                shape.style.transform = 'translate(0px, 0px)';
            });
        });
    }


    // ==========================================
    // 6. MAGNETIC BUTTONS
    // ==========================================
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);
            
            const pullFactor = 0.35;
            btn.style.transform = `translate(${x * pullFactor}px, ${y * pullFactor}px) scale(1.03)`;
            
            const text = btn.querySelector('span');
            if (text) {
                text.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            }
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px) scale(1)';
            const text = btn.querySelector('span');
            if (text) {
                text.style.transform = 'translate(0px, 0px)';
            }
        });
    });


    // ==========================================
    // 7. STICKY NAVBAR SCROLL ACTION
    // ==========================================
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Active Link Highlighting
    const sections = document.querySelectorAll('#hero, #challenges, #founder, #methodology, #programs, #testimonials, #gallery');
    const navItems = document.querySelectorAll('.nav-links a');
    
    if (sections.length > 0 && navItems.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navItems.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }


    // ==========================================
    // 8. MOBILE NAVIGATION MENU TOGGLE
    // ==========================================
    const mobileToggle = document.querySelector('.nav-mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            const spans = mobileToggle.querySelectorAll('span');
            if (navLinks.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const spans = mobileToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }


    // ==========================================
    // 9. TESTIMONIALS SLIDER (RTL AWARE)
    // ==========================================
    const wrapper = document.querySelector('.testimonials-wrapper');
    const track = document.querySelector('.testimonials-track');
    const dots = document.querySelectorAll('.testimonial-dot');
    
    if (wrapper && track && dots.length > 0) {
        const cards = track.querySelectorAll('.testimonial-card');

        // Click dots to scroll
        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.getAttribute('data-slide'));
                const card = cards[index];
                if (card) {
                    wrapper.scrollTo({
                        left: card.offsetLeft,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Update active dot on scroll
        let scrollTimeout;
        wrapper.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                let activeIndex = 0;
                let minDiff = Infinity;
                
                cards.forEach((card, idx) => {
                    const diff = Math.abs(card.offsetLeft - wrapper.scrollLeft);
                    if (diff < minDiff) {
                        minDiff = diff;
                        activeIndex = idx;
                    }
                });

                dots.forEach((d, idx) => {
                    if (idx === activeIndex) {
                        d.classList.add('active');
                    } else {
                        d.classList.remove('active');
                    }
                });
            }, 50); // Debounce scroll event to make indicator transitions smoother
        });

        // Drag to scroll (desktop mouse drag support)
        let isDown = false;
        let startX;
        let scrollLeft;

        wrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - wrapper.offsetLeft;
            scrollLeft = wrapper.scrollLeft;
        });

        wrapper.addEventListener('mouseleave', () => {
            isDown = false;
        });

        wrapper.addEventListener('mouseup', () => {
            isDown = false;
        });

        wrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - wrapper.offsetLeft;
            const walk = (x - startX) * 1.5;
            wrapper.scrollLeft = scrollLeft - walk;
        });
    }


    // ==========================================
    // 10. INTERACTIVE CONTACT FORM SUBMISSION
    // ==========================================
    const contactForm = document.getElementById('consultation-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>جاري إرسال طلبك...</span>';
            
            setTimeout(() => {
                submitBtn.innerHTML = '<span>تم الإرسال بنجاح! ✓</span>';
                submitBtn.style.background = 'linear-gradient(135deg, #6cbff3, #5aa9db)';
                
                const successMsg = document.createElement('div');
                successMsg.className = 'form-success-alert';
                successMsg.style.cssText = `
                    margin-top: 1.5rem;
                    padding: 1rem;
                    border-radius: 12px;
                    background: rgba(108, 191, 243, 0.1);
                    border: 1px solid rgba(108, 191, 243, 0.3);
                    color: #6cbff3;
                    text-align: center;
                    font-weight: 500;
                    animation: fadeIn 0.4s ease;
                `;
                successMsg.innerText = 'نشكرك على ثقتك! تم تسجيل طلبك بنجاح وسيتصل بك مستشارنا التربوي خلال ٢٤ ساعة.';
                contactForm.appendChild(successMsg);
                
                contactForm.reset();
                
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    successMsg.remove();
                }, 5000);
                
            }, 1500);
        });
    }

    // ==========================================
    // 11. HORIZONTAL GALLERY SCROLL
    // ==========================================
    const galleryTrack = document.getElementById('gallery-track');
    const galleryPrev = document.getElementById('gallery-prev');
    const galleryNext = document.getElementById('gallery-next');

    if (galleryTrack && galleryPrev && galleryNext) {
        // Button Clicks
        galleryPrev.addEventListener('click', () => {
            // Scroll right (since direction is RTL, prev goes right/forward in RTL)
            galleryTrack.scrollBy({ left: 320, behavior: 'smooth' });
        });

        galleryNext.addEventListener('click', () => {
            // Scroll left (next goes left/backward in RTL)
            galleryTrack.scrollBy({ left: -320, behavior: 'smooth' });
        });

        // Drag to scroll
        let isDown = false;
        let startX;
        let scrollLeft;

        galleryTrack.addEventListener('mousedown', (e) => {
            isDown = true;
            galleryTrack.classList.add('active');
            startX = e.pageX - galleryTrack.offsetLeft;
            scrollLeft = galleryTrack.scrollLeft;
        });

        galleryTrack.addEventListener('mouseleave', () => {
            isDown = false;
            galleryTrack.classList.remove('active');
        });

        galleryTrack.addEventListener('mouseup', () => {
            isDown = false;
            galleryTrack.classList.remove('active');
        });

        galleryTrack.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - galleryTrack.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast multiplier
            galleryTrack.scrollLeft = scrollLeft - walk;
        });
    }
});
