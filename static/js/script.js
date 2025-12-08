document.addEventListener('DOMContentLoaded', () => {
    // Force start at top
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    document.body.classList.add('no-scroll'); // Disable scrolling initially
    fetchData();
    setupScrollSpy();
});

function setupScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        // Check if we've scrolled to the bottom of the page
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
             const lastSection = sections[sections.length - 1];
             if (lastSection) {
                 current = lastSection.getAttribute('id');
             }
        } else {
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                // 150px offset for the fixed navbar
                if (pageYOffset >= (sectionTop - 150)) {
                    current = section.getAttribute('id');
                }
            });
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();

        if (data.error) {
            console.error('Server error:', data.error);
            alert('Error loading data: ' + data.error);
            return;
        }
        
        console.log('Fetched data:', data); // Debug log

        renderProfile(data.profile);
        renderProjects(data.projects);
        renderEducation(data.education);
        renderSkills(data.skills);
        renderCertifications(data.certifications);
        renderAchievements(data.achievements);

        // Trigger intro fade-in animation
        const introContainer = document.querySelector('.intro-text-container');
        if (introContainer) {
            // Use requestAnimationFrame to ensure the browser paints the initial state (opacity 0) first
            requestAnimationFrame(() => {
                introContainer.classList.add('visible');
            });
        }

        // Wait for initial animation to finish
        setTimeout(() => {
            const overlay = document.getElementById('intro-overlay');
            const introTitle = document.querySelector('.intro-title');
            const introLine = document.querySelector('.intro-line');
            // const introSubtitle = document.querySelector('.intro-subtitle');
            const finalName = document.getElementById('hero-name');

            if (overlay && introTitle && finalName) {
                // 1. Fade out subtitle and line
                introLine.style.opacity = '0';
                // introSubtitle.style.opacity = '0';

                // 2. Calculate positions
                const startRect = introTitle.getBoundingClientRect();
                const endRect = finalName.getBoundingClientRect();

                // 3. Calculate translation
                const deltaX = endRect.left - startRect.left;
                const deltaY = endRect.top - startRect.top;
                
                // 4. Calculate scale (font size difference)
                // Get computed font sizes to be precise
                const startSize = parseFloat(window.getComputedStyle(introTitle).fontSize);
                const endSize = parseFloat(window.getComputedStyle(finalName).fontSize);
                const scale = endSize / startSize;

                // 5. Apply transformation to move the title
                // We use translate and scale. Note: transform-origin is set to 'top left' in CSS
                introTitle.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
                
                // 6. Fade out the background overlay at the same time
                overlay.style.backgroundColor = 'transparent';

                // 7. After transition completes
                setTimeout(() => {
                    // Show the real header name
                    finalName.style.opacity = '1';
                    
                    // Fade out the intro title to avoid double-rendering artifacts
                    introTitle.style.opacity = '0';
                    introTitle.style.transition = 'opacity 0.2s';

                    // Hide the overlay completely after a short delay
                    setTimeout(() => {
                        overlay.style.display = 'none';
                        document.body.classList.remove('no-scroll'); // Re-enable scrolling
                    }, 200);
                }, 1000); // Match the transition duration in CSS (1s)
            }
        }, 800); 

    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        // Even on error, remove overlay so user isn't stuck
        const overlay = document.getElementById('intro-overlay');
        if (overlay) overlay.style.display = 'none';
        document.body.classList.remove('no-scroll');
        const finalName = document.getElementById('hero-name');
        if (finalName) finalName.style.opacity = '1';
    }
}

function renderProfile(profile) {
    if (!profile) return;
    
    // Populate Name in Intro and Hero
    const name = profile.name; 
    if (name) {
        document.querySelector('.intro-title').textContent = name;
        document.getElementById('hero-name').textContent = name;
        document.getElementById('footer-name').textContent = name;
        document.title = `${name} | Portfolio`;
    }
    
    // Populate Subtitle in Intro
    // document.querySelector('.intro-subtitle').textContent = `PORTFOLIO ${new Date().getFullYear()}`;

    document.getElementById('hero-title').textContent = profile.title;
    document.getElementById('hero-bio').textContent = profile.bio;
    document.getElementById('hero-avatar').src = profile.avatar;
    
    // Handle CV Link
    const cvBtn = document.getElementById('btn-cv');
    if (profile.cv) {
        cvBtn.href = profile.cv;
    } else {
        cvBtn.style.display = 'none';
    }

    // Handle Contact Link
    const contactBtn = document.getElementById('btn-contact');
    if (profile.email) {
        contactBtn.href = `mailto:${profile.email}`;
    } else {
        contactBtn.style.display = 'none';
    }

    const socialContainer = document.getElementById('hero-socials');
    profile.socials.forEach(social => {
        const a = document.createElement('a');
        a.href = social.url;
        a.target = "_blank";
        a.innerHTML = `<i class="${social.icon}"></i>`;
        socialContainer.appendChild(a);
    });
}

function renderProjects(projects) {
    const container = document.getElementById('projects-grid');
    projects.forEach(proj => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Generate tech stack HTML
        const techHtml = proj.techStack.map(t => `<span class="tech-tag">${t}</span>`).join('');
        
        // Links
        let linksHtml = '';
        if (proj.repo) linksHtml += `<a href="${proj.repo}" target="_blank" style="color:white; margin-right:10px;"><i class="fab fa-github"></i></a>`;
        if (proj.link) linksHtml += `<a href="${proj.link}" target="_blank" style="color:white;"><i class="fas fa-external-link-alt"></i></a>`;

        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">${proj.title}</div>
                <div>${linksHtml}</div>
            </div>
            <div style="font-size: 0.8rem; color: #8b949e; margin-bottom: 5px;">${proj.category}</div>
            <p class="card-desc">${proj.description}</p>
            <div class="tech-stack">${techHtml}</div>
        `;
        container.appendChild(card);
    });
}

function renderEducation(eduList) {
    const container = document.getElementById('education-list');
    if (!eduList || eduList.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary)">No education details found.</p>';
        return;
    }
    eduList.forEach(edu => {
        const item = document.createElement('div');
        item.className = 'card';
        item.style.marginBottom = '20px';
        item.innerHTML = `
            <h3 style="color: var(--text-primary)">${edu.institution}</h3>
            <div style="display:flex; justify-content:space-between; color: var(--accent); margin: 5px 0;">
                <span>${edu.degree}</span>
                <span>${edu.year}</span>
            </div>
            <p style="color: var(--text-secondary)">${edu.details}</p>
        `;
        container.appendChild(item);
    });
}

function renderSkills(skills) {
    const container = document.getElementById('skills-list');
    skills.forEach(cat => {
        const catDiv = document.createElement('div');
        catDiv.className = 'skill-category';
        
        const itemsHtml = cat.items.map(item => `
            <div class="skill-item">
                <i class="${item.icon}"></i>
                <span>${item.name}</span>
            </div>
        `).join('');

        catDiv.innerHTML = `
            <h3>${cat.category}</h3>
            <div class="skill-items">${itemsHtml}</div>
        `;
        container.appendChild(catDiv);
    });
}

function renderCertifications(certs) {
    const container = document.getElementById('certifications-list');
    certs.forEach(cert => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.marginBottom = '15px';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <strong>${cert.title}</strong>
                <span style="color:var(--text-secondary)">${cert.year}</span>
            </div>
            <div style="color:var(--text-secondary)">${cert.issuer}</div>
            <a href="${cert.link}" target="_blank" style="color:var(--accent); font-size:0.8rem; text-decoration:none; margin-top:5px; display:inline-block;">View Certificate &rarr;</a>
        `;
        container.appendChild(div);
    });
}

function renderAchievements(achievements) {
    const container = document.getElementById('achievements-list');
    achievements.forEach(grp => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const itemsHtml = grp.items.map(i => {
            let titleHtml = `<span style="color:white;">${i.title}</span>`;
            if (i.link && i.link.trim() !== "") {
                titleHtml = `<a href="${i.link}" target="_blank" style="color:white; text-decoration:none; border-bottom: 1px dotted var(--accent); transition: color 0.3s;">${i.title} <i class="fas fa-external-link-alt" style="font-size: 0.7em; color: var(--accent); margin-left: 5px;"></i></a>`;
            }
            return `
            <li style="margin-bottom: 8px;">
                ${titleHtml} 
                <span style="color:var(--accent);"> - ${i.rank}</span>
            </li>
        `}).join('');

        card.innerHTML = `
            <div class="card-title">${grp.category}</div>
            <ul style="list-style: none; padding-left: 0; margin-top: 10px; color: var(--text-secondary)">
                ${itemsHtml}
            </ul>
        `;
        container.appendChild(card);
    });
}