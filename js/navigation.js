/**
 * Navigation Enhancement Script
 * Handles active page highlighting and navigation improvements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get current page path
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Remove existing active classes
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current page link
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        const linkPage = linkPath.split('/').pop();
        
        // Handle different path scenarios
        if (linkPage === currentPage || 
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === 'index.html' && linkPage === 'index.html') ||
            (currentPath.includes('/projects/') && linkPage === 'projects.html') ||
            (currentPage === 'about.html' && linkPage === 'about.html')) {
            link.classList.add('active');
        }
    });
    
    // Handle logo click to go home
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Add keyboard navigation support
    navLinks.forEach((link, index) => {
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = link.getAttribute('href');
            }
            
            // Arrow key navigation for menu items
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (index + 1) % navLinks.length;
                navLinks[nextIndex].focus();
            }
            
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (index - 1 + navLinks.length) % navLinks.length;
                navLinks[prevIndex].focus();
            }
            
            // Home key - focus first item
            if (e.key === 'Home') {
                e.preventDefault();
                navLinks[0].focus();
            }
            
            // End key - focus last item
            if (e.key === 'End') {
                e.preventDefault();
                navLinks[navLinks.length - 1].focus();
            }
        });
    });
    
    // Add smooth scroll behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add loading state for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't add loading state for external links or anchors
            const href = link.getAttribute('href');
            if (href.startsWith('http') || href.startsWith('#')) {
                return;
            }
            
            // Add loading state
            link.style.opacity = '0.7';
            link.style.pointerEvents = 'none';
            
            // Remove loading state after navigation (fallback)
            setTimeout(() => {
                link.style.opacity = '';
                link.style.pointerEvents = '';
            }, 2000);
        });
    });
});

/**
 * Function to validate internal links
 * Checks if all internal links are working correctly
 */
function validateInternalLinks() {
    const internalLinks = document.querySelectorAll('a[href]:not([href^="http"]):not([href^="#"]):not([href^="mailto"])');
    const brokenLinks = [];
    
    internalLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Create a test request to check if the link exists
        fetch(href, { method: 'HEAD' })
            .then(response => {
                if (!response.ok) {
                    brokenLinks.push({
                        element: link,
                        href: href,
                        text: link.textContent.trim(),
                        status: response.status
                    });
                }
            })
            .catch(error => {
                brokenLinks.push({
                    element: link,
                    href: href,
                    text: link.textContent.trim(),
                    error: error.message
                });
            });
    });
    
    // Log broken links in development
    if (brokenLinks.length > 0 && window.location.hostname === 'localhost') {
        console.warn('Broken internal links found:', brokenLinks);
    }
    
    return brokenLinks;
}

/**
 * Function to add breadcrumb navigation for project pages
 */
function initializeBreadcrumbs() {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;
    
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment);
    
    // Clear existing breadcrumb content
    breadcrumb.innerHTML = '';
    
    // Add home link
    const homeLink = document.createElement('a');
    homeLink.href = '../index.html';
    homeLink.textContent = 'Home';
    breadcrumb.appendChild(homeLink);
    
    // Add separator
    const separator1 = document.createElement('span');
    separator1.className = 'breadcrumb-separator';
    separator1.textContent = '›';
    breadcrumb.appendChild(separator1);
    
    // Add projects link if we're in a project page
    if (pathSegments.includes('projects')) {
        const projectsLink = document.createElement('a');
        projectsLink.href = '../projects.html';
        projectsLink.textContent = 'Projects';
        breadcrumb.appendChild(projectsLink);
        
        const separator2 = document.createElement('span');
        separator2.className = 'breadcrumb-separator';
        separator2.textContent = '›';
        breadcrumb.appendChild(separator2);
    }
    
    // Add current page
    const currentPage = document.createElement('span');
    currentPage.className = 'breadcrumb-current';
    currentPage.textContent = document.title.split(' - ')[0];
    breadcrumb.appendChild(currentPage);
}

// Initialize breadcrumbs on page load
document.addEventListener('DOMContentLoaded', initializeBreadcrumbs);

// Run link validation in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(validateInternalLinks, 1000);
    });
}