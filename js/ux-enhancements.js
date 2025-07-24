/**
 * User Experience Enhancements
 * Provides form validation, loading animations, and micro-interactions
 */

class UXEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupLoadingAnimations();
        this.setupMicroInteractions();
        this.setupSmoothScrolling();
        this.setupPageTransitions();
    }

    setupFormValidation() {
        // Enhanced file upload validation
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.validateFileInput(e.target);
            });
        });

        // Form submission enhancements
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmission(e);
            });
        });
    }

    validateFileInput(input) {
        const file = input.files[0];
        const feedback = this.getOrCreateFeedback(input);
        
        // Clear previous validation state
        input.classList.remove('valid', 'invalid');
        
        if (!file) {
            this.setValidationState(input, feedback, 'neutral', '');
            return;
        }

        // File size validation (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            this.setValidationState(input, feedback, 'invalid', 
                'File size must be less than 10MB. Please choose a smaller file.');
            return;
        }

        // File type validation
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'image/tif'];
        if (!allowedTypes.includes(file.type)) {
            this.setValidationState(input, feedback, 'invalid', 
                'Please select a valid image file (JPG, PNG, or TIFF).');
            return;
        }

        // Success state
        this.setValidationState(input, feedback, 'valid', 
            `✓ ${file.name} (${this.formatFileSize(file.size)}) ready for analysis`);
    }

    getOrCreateFeedback(input) {
        let feedback = input.parentNode.querySelector('.form-feedback');
        
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'form-feedback';
            feedback.setAttribute('role', 'status');
            feedback.setAttribute('aria-live', 'polite');
            input.parentNode.appendChild(feedback);
        }
        
        return feedback;
    }

    setValidationState(input, feedback, state, message) {
        // Update input classes
        input.classList.remove('valid', 'invalid');
        if (state !== 'neutral') {
            input.classList.add(state);
        }

        // Update feedback
        feedback.className = `form-feedback ${state}`;
        feedback.textContent = message;
        feedback.setAttribute('aria-live', state === 'invalid' ? 'assertive' : 'polite');

        // Update aria-invalid attribute
        input.setAttribute('aria-invalid', state === 'invalid' ? 'true' : 'false');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    handleFormSubmission(e) {
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        
        // Add loading state to submit button
        if (submitBtn) {
            this.setButtonLoading(submitBtn, true);
        }

        // Validate all form inputs
        const isValid = this.validateForm(form);
        
        if (!isValid) {
            e.preventDefault();
            if (submitBtn) {
                this.setButtonLoading(submitBtn, false);
            }
            this.showFormError(form, 'Please correct the errors above before submitting.');
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (input.type === 'file') {
                this.validateFileInput(input);
                if (input.classList.contains('invalid')) {
                    isValid = false;
                }
            } else if (!input.value.trim()) {
                const feedback = this.getOrCreateFeedback(input);
                this.setValidationState(input, feedback, 'invalid', 'This field is required.');
                isValid = false;
            }
        });

        return isValid;
    }

    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            
            // Store original text
            if (!button.dataset.originalText) {
                button.dataset.originalText = button.textContent;
            }
            
            // Update button text for screen readers
            const loadingText = button.dataset.loadingText || 'Processing...';
            button.setAttribute('aria-label', loadingText);
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            button.setAttribute('aria-busy', 'false');
            
            // Restore original text
            if (button.dataset.originalText) {
                button.setAttribute('aria-label', button.dataset.originalText);
            }
        }
    }

    showFormError(form, message) {
        let errorContainer = form.querySelector('.form-error');
        
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'form-error error';
            errorContainer.setAttribute('role', 'alert');
            errorContainer.setAttribute('aria-live', 'assertive');
            form.insertBefore(errorContainer, form.firstChild);
        }
        
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorContainer.parentNode) {
                errorContainer.style.display = 'none';
            }
        }, 5000);
    }

    showSuccessMessage(container, message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.setAttribute('role', 'status');
        successDiv.setAttribute('aria-live', 'polite');
        successDiv.innerHTML = `<strong>Success!</strong> ${message}`;
        
        container.insertBefore(successDiv, container.firstChild);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 5000);
    }

    setupLoadingAnimations() {
        // Enhance existing loading states
        const loadingElements = document.querySelectorAll('.loading');
        
        loadingElements.forEach(element => {
            element.setAttribute('aria-label', 'Loading...');
            element.setAttribute('role', 'status');
        });
    }

    setupMicroInteractions() {
        // Add fade-in animation to sections as they come into view
        this.setupIntersectionObserver();
        
        // Enhanced hover effects for interactive elements
        this.setupHoverEffects();
        
        // Add ripple effect to buttons
        this.setupRippleEffect();
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe sections and cards
        const elementsToObserve = document.querySelectorAll('.hero, .card, .projects-section, .filter-container');
        elementsToObserve.forEach(element => {
            observer.observe(element);
        });
    }

    setupHoverEffects() {
        // Add pulse effect to important buttons
        const primaryButtons = document.querySelectorAll('.btn:not(.filter-btn)');
        
        primaryButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (!button.classList.contains('loading')) {
                    button.classList.add('pulse');
                }
            });
            
            button.addEventListener('mouseleave', () => {
                button.classList.remove('pulse');
            });
        });
    }

    setupRippleEffect() {
        const buttons = document.querySelectorAll('.btn, .filter-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e);
            });
        });
    }

    createRipple(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        // Add ripple animation CSS if not already present
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                .btn, .filter-btn {
                    position: relative;
                    overflow: hidden;
                }
            `;
            document.head.appendChild(style);
        }
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    setupSmoothScrolling() {
        // Enhanced smooth scrolling for anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update focus for accessibility
                    setTimeout(() => {
                        targetElement.focus();
                    }, 500);
                }
            });
        });
    }

    setupPageTransitions() {
        // Add loading state for page navigation
        const internalLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="http"]):not([href^="mailto"])');
        
        internalLinks.forEach(link => {
            link.addEventListener('click', () => {
                document.body.style.opacity = '0.8';
                document.body.style.transition = 'opacity 0.3s ease';
            });
        });
    }

    // Public method to show success message
    static showSuccess(container, message) {
        const instance = new UXEnhancements();
        instance.showSuccessMessage(container, message);
    }

    // Public method to set button loading state
    static setButtonLoading(button, isLoading) {
        const instance = new UXEnhancements();
        instance.setButtonLoading(button, isLoading);
    }
}

// Initialize UX enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uxEnhancements = new UXEnhancements();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UXEnhancements;
}