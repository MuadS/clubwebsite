/**
 * Tumor Detection Demo JavaScript
 * Handles form submission, file processing, API calls, and result display
 */

class TumorDetector {
    constructor() {
        this.form = document.getElementById('tumor-form');
        this.fileInput = document.getElementById('image-upload');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.btnText = document.querySelector('.btn-text');
        this.loadingSpinner = document.getElementById('loading-spinner');
        this.resultsContainer = document.getElementById('results-container');
        this.resultsContent = document.getElementById('results-content');
        this.errorContainer = document.getElementById('error-container');
        this.errorMessage = document.getElementById('error-message');
        
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff'];
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Add keyboard navigation support
        this.fileInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.fileInput.click();
            }
        });
        
        // Add drag and drop support with accessibility
        this.fileInput.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.fileInput.setAttribute('aria-describedby', 'file-help drag-help');
        });
        
        this.fileInput.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.fileInput.setAttribute('aria-describedby', 'file-help');
        });
        
        this.fileInput.addEventListener('drop', (e) => {
            e.preventDefault();
            this.fileInput.setAttribute('aria-describedby', 'file-help');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.fileInput.files = files;
                this.handleFileSelect({ target: { files: files } });
            }
        });
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.validateFile(file);
        }
    }
    
    validateFile(file) {
        // Clear previous errors
        this.hideError();
        
        // Update file input ARIA attributes
        this.fileInput.setAttribute('aria-invalid', 'false');
        
        // Check file size
        if (file.size > this.maxFileSize) {
            this.showError('File size exceeds 10MB limit. Please select a smaller image.');
            this.fileInput.value = '';
            this.fileInput.setAttribute('aria-invalid', 'true');
            this.fileInput.focus();
            return false;
        }
        
        // Check file type
        if (!this.allowedTypes.includes(file.type)) {
            this.showError('Invalid file type. Please select a JPG, PNG, or TIFF image.');
            this.fileInput.value = '';
            this.fileInput.setAttribute('aria-invalid', 'true');
            this.fileInput.focus();
            return false;
        }
        
        return true;
    }
    
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const file = this.fileInput.files[0];
        if (!file) {
            this.showError('Please select an image file first.');
            return;
        }
        
        if (!this.validateFile(file)) {
            return;
        }
        
        try {
            this.setLoadingState(true);
            this.hideError();
            this.hideResults();
            
            const result = await this.analyzeImage(file);
            this.displayResults(result);
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(this.getErrorMessage(error));
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async analyzeImage(file) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', file);
        
        // Make request to serverless function
        const response = await fetch('/.netlify/functions/run-tumor', {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type header - let browser set it with boundary
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
    }
    
    displayResults(result) {
        // Clear previous results
        this.resultsContent.innerHTML = '';
        
        // Create results HTML with enhanced styling
        const resultsHTML = `
            <div class="result-display fade-in">
                ${result.heatmapUrl ? `
                    <img src="${result.heatmapUrl}" alt="Tumor Detection Heatmap" class="result-image">
                ` : ''}
                
                <div class="result-stats">
                    ${result.confidence ? `
                        <div class="stat-item">
                            <span class="stat-value">${Math.round(result.confidence * 100)}%</span>
                            <span class="stat-label">Confidence</span>
                        </div>
                    ` : ''}
                    
                    ${result.malignancyScore ? `
                        <div class="stat-item">
                            <span class="stat-value">${Math.round(result.malignancyScore * 100)}%</span>
                            <span class="stat-label">Malignancy Score</span>
                        </div>
                    ` : ''}
                    
                    ${result.processingTime ? `
                        <div class="stat-item">
                            <span class="stat-value">${result.processingTime}s</span>
                            <span class="stat-label">Processing Time</span>
                        </div>
                    ` : ''}
                </div>
                
                ${result.analysis ? `
                    <div class="analysis-text">
                        <h4>Analysis Summary</h4>
                        <p>${result.analysis}</p>
                    </div>
                ` : ''}
                
                <div class="disclaimer">
                    <small><strong>Disclaimer:</strong> This is a research demo and should not be used for medical diagnosis. Always consult healthcare professionals for medical concerns.</small>
                </div>
            </div>
        `;
        
        this.resultsContent.innerHTML = resultsHTML;
        this.showResults();
        
        // Show success message using UX enhancements if available
        if (window.uxEnhancements && typeof window.uxEnhancements.showSuccessMessage === 'function') {
            const demoContainer = document.querySelector('.tumor-demo');
            window.uxEnhancements.showSuccessMessage(demoContainer, 'Image analysis completed successfully!');
        }
        
        // Smooth scroll to results
        setTimeout(() => {
            this.resultsContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 300);
    }
    
    setLoadingState(isLoading) {
        const statusElement = document.getElementById('analyze-status');
        
        if (isLoading) {
            this.analyzeBtn.disabled = true;
            this.analyzeBtn.setAttribute('aria-busy', 'true');
            this.btnText.textContent = 'Analyzing...';
            this.loadingSpinner.style.display = 'inline-block';
            this.loadingSpinner.setAttribute('aria-hidden', 'false');
            
            // Update status for screen readers
            if (statusElement) {
                statusElement.textContent = 'Analysis in progress. Please wait...';
            }
        } else {
            this.analyzeBtn.disabled = false;
            this.analyzeBtn.setAttribute('aria-busy', 'false');
            this.btnText.textContent = 'Analyze Image';
            this.loadingSpinner.style.display = 'none';
            this.loadingSpinner.setAttribute('aria-hidden', 'true');
            
            // Clear status for screen readers
            if (statusElement) {
                statusElement.textContent = '';
            }
        }
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorContainer.style.display = 'block';
        
        // Auto-hide error after 10 seconds
        setTimeout(() => {
            this.hideError();
        }, 10000);
    }
    
    hideError() {
        this.errorContainer.style.display = 'none';
    }
    
    showResults() {
        this.resultsContainer.style.display = 'block';
    }
    
    hideResults() {
        this.resultsContainer.style.display = 'none';
    }
    
    getErrorMessage(error) {
        // Handle different types of errors with user-friendly messages
        if (error.message.includes('Failed to fetch')) {
            return 'Network error. Please check your internet connection and try again.';
        }
        
        if (error.message.includes('413')) {
            return 'File too large. Please select a smaller image (under 10MB).';
        }
        
        if (error.message.includes('415')) {
            return 'Unsupported file format. Please use JPG, PNG, or TIFF images.';
        }
        
        if (error.message.includes('429')) {
            return 'Too many requests. Please wait a moment before trying again.';
        }
        
        if (error.message.includes('500')) {
            return 'Server error. Our AI model is temporarily unavailable. Please try again later.';
        }
        
        if (error.message.includes('503')) {
            return 'Service temporarily unavailable. The AI model is loading, please try again in a few moments.';
        }
        
        // Return the original error message if it's user-friendly, otherwise generic message
        if (error.message && error.message.length < 100 && !error.message.includes('HTTP')) {
            return error.message;
        }
        
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
    }
}

// Initialize the tumor detector when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TumorDetector();
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TumorDetector;
}