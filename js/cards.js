/**
 * Project Cards Filtering System
 * Provides tag-based filtering functionality for project showcase
 */

class ProjectFilter {
    constructor() {
        this.projectCards = document.querySelectorAll('.project-card');
        this.projectsGrid = document.getElementById('projects-grid');
        this.noProjectsMessage = document.getElementById('no-projects-message');
        this.activeFilters = new Set(['all']);
        
        this.init();
    }

    init() {
        this.createFilterControls();
        this.bindEvents();
        this.updateDisplay();
    }

    createFilterControls() {
        // Create filter container
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';
        filterContainer.innerHTML = `
            <div class="filter-header">
                <h3>Filter Projects</h3>
                <button class="filter-toggle" aria-expanded="false" aria-controls="filter-buttons">
                    <span>Categories</span>
                    <span class="filter-arrow">▼</span>
                </button>
            </div>
            <div class="filter-buttons" id="filter-buttons">
                <!-- Filter buttons will be inserted here -->
            </div>
        `;

        // Insert filter container before the projects grid
        const projectsSection = document.querySelector('.projects-section .container');
        const heading = projectsSection.querySelector('h2');
        heading.insertAdjacentElement('afterend', filterContainer);

        this.filterContainer = filterContainer;
        this.filterButtons = filterContainer.querySelector('.filter-buttons');
        this.filterToggle = filterContainer.querySelector('.filter-toggle');

        this.generateFilterButtons();
    }

    generateFilterButtons() {
        // Extract all unique tags from project cards
        const allTags = new Set();
        
        this.projectCards.forEach(card => {
            const tags = card.dataset.tags?.split(' ') || [];
            tags.forEach(tag => allTags.add(tag));
        });

        // Create category mappings for better UX
        const categoryMap = {
            'all': 'All Projects',
            'vision': 'Computer Vision',
            'medical': 'Medical AI',
            'materials': 'Materials Science',
            'bioinformatics': 'Bioinformatics',
            'pharmaceutical': 'Drug Discovery',
            'genomics': 'Genomics',
            'ecology': 'Environmental',
            'simulation': 'Simulation',
            'molecular': 'Molecular',
            'environmental': 'Environmental',
            'classification': 'Classification',
            'protein': 'Protein Analysis'
        };

        // Create filter buttons
        const filterButtons = ['all', ...Array.from(allTags).sort()];
        
        this.filterButtons.innerHTML = filterButtons.map(tag => {
            const displayName = categoryMap[tag] || this.capitalizeTag(tag);
            const isActive = this.activeFilters.has(tag);
            
            return `
                <button 
                    class="filter-btn ${isActive ? 'active' : ''}" 
                    data-filter="${tag}"
                    aria-pressed="${isActive}"
                >
                    ${displayName}
                </button>
            `;
        }).join('');
    }

    capitalizeTag(tag) {
        return tag.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    bindEvents() {
        // Filter button clicks
        this.filterButtons.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.handleFilterClick(e.target);
            }
        });

        // Mobile filter toggle
        this.filterToggle.addEventListener('click', () => {
            this.toggleMobileFilters();
        });

        // Close mobile filters when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.filterContainer.contains(e.target)) {
                this.closeMobileFilters();
            }
        });

        // Keyboard navigation for filters
        this.filterButtons.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (e.target.classList.contains('filter-btn')) {
                    this.handleFilterClick(e.target);
                }
            }
        });
    }

    handleFilterClick(button) {
        const filter = button.dataset.filter;
        
        if (filter === 'all') {
            // Clear all filters and show all projects
            this.activeFilters.clear();
            this.activeFilters.add('all');
        } else {
            // Toggle specific filter
            this.activeFilters.delete('all');
            
            if (this.activeFilters.has(filter)) {
                this.activeFilters.delete(filter);
                
                // If no filters active, default to 'all'
                if (this.activeFilters.size === 0) {
                    this.activeFilters.add('all');
                }
            } else {
                this.activeFilters.add(filter);
            }
        }

        this.updateFilterButtons();
        this.updateDisplay();
        this.announceFilterChange();
    }

    updateFilterButtons() {
        const buttons = this.filterButtons.querySelectorAll('.filter-btn');
        
        buttons.forEach(button => {
            const filter = button.dataset.filter;
            const isActive = this.activeFilters.has(filter);
            
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive);
        });
    }

    updateDisplay() {
        let visibleCount = 0;

        this.projectCards.forEach(card => {
            const cardTags = card.dataset.tags?.split(' ') || [];
            const shouldShow = this.activeFilters.has('all') || 
                             cardTags.some(tag => this.activeFilters.has(tag));

            if (shouldShow) {
                card.style.display = '';
                card.setAttribute('aria-hidden', 'false');
                visibleCount++;
                
                // Add animation class for smooth appearance
                card.classList.add('filter-show');
                setTimeout(() => card.classList.remove('filter-show'), 300);
            } else {
                card.style.display = 'none';
                card.setAttribute('aria-hidden', 'true');
            }
        });

        // Show/hide no projects message
        if (visibleCount === 0) {
            this.noProjectsMessage.style.display = 'block';
            this.noProjectsMessage.setAttribute('aria-hidden', 'false');
        } else {
            this.noProjectsMessage.style.display = 'none';
            this.noProjectsMessage.setAttribute('aria-hidden', 'true');
        }

        // Update projects count in filter header
        this.updateProjectsCount(visibleCount);
    }

    updateProjectsCount(count) {
        let countElement = this.filterContainer.querySelector('.projects-count');
        
        if (!countElement) {
            countElement = document.createElement('span');
            countElement.className = 'projects-count';
            this.filterContainer.querySelector('.filter-header h3').appendChild(countElement);
        }

        const totalProjects = this.projectCards.length;
        countElement.textContent = count === totalProjects ? 
            ` (${totalProjects})` : 
            ` (${count} of ${totalProjects})`;
    }

    toggleMobileFilters() {
        const isExpanded = this.filterToggle.getAttribute('aria-expanded') === 'true';
        
        this.filterToggle.setAttribute('aria-expanded', !isExpanded);
        this.filterButtons.classList.toggle('show', !isExpanded);
        
        const arrow = this.filterToggle.querySelector('.filter-arrow');
        arrow.textContent = isExpanded ? '▼' : '▲';
    }

    closeMobileFilters() {
        this.filterToggle.setAttribute('aria-expanded', 'false');
        this.filterButtons.classList.remove('show');
        
        const arrow = this.filterToggle.querySelector('.filter-arrow');
        arrow.textContent = '▼';
    }

    announceFilterChange() {
        // Create or update screen reader announcement
        let announcement = document.getElementById('filter-announcement');
        
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.id = 'filter-announcement';
            announcement.className = 'sr-only';
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            document.body.appendChild(announcement);
        }

        const activeFilterNames = Array.from(this.activeFilters).map(filter => {
            if (filter === 'all') return 'All Projects';
            return this.capitalizeTag(filter);
        }).join(', ');

        const visibleCount = Array.from(this.projectCards).filter(card => 
            card.style.display !== 'none'
        ).length;

        announcement.textContent = `Filtered to show ${visibleCount} projects in categories: ${activeFilterNames}`;
    }

    // Public method to programmatically set filters
    setFilter(filters) {
        this.activeFilters.clear();
        
        if (Array.isArray(filters)) {
            filters.forEach(filter => this.activeFilters.add(filter));
        } else {
            this.activeFilters.add(filters);
        }

        if (this.activeFilters.size === 0) {
            this.activeFilters.add('all');
        }

        this.updateFilterButtons();
        this.updateDisplay();
    }

    // Public method to get current filters
    getActiveFilters() {
        return Array.from(this.activeFilters);
    }
}

// Initialize the filter system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on projects page
    if (document.getElementById('projects-grid')) {
        window.projectFilter = new ProjectFilter();
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectFilter;
}