// Global variables
let selectedService = '';

// DOM Elements
const bookingForm = document.getElementById('bookingForm');
const serviceCards = document.querySelectorAll('.service-card');
const serviceSelect = document.getElementById('service');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set minimum date to today
    setMinDate();
    
    // Add event listeners
    addEventListeners();
    
    // Initialize service selection
    initializeServiceSelection();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
}

function setMinDate() {
    const dateInput = document.getElementById('date');
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    dateInput.min = formattedDate;
}

function addEventListeners() {
    // Form submission
    bookingForm.addEventListener('submit', handleFormSubmission);
    
    // Service card clicks
    serviceCards.forEach(card => {
        card.addEventListener('click', handleServiceCardClick);
    });
    
    // Service dropdown change
    serviceSelect.addEventListener('change', handleServiceSelectChange);
    
    // Real-time validation
    addRealTimeValidation();
}

function initializeServiceSelection() {
    // Sync service cards with dropdown
    serviceCards.forEach(card => {
        const service = card.dataset.service;
        card.addEventListener('click', () => {
            selectService(service);
        });
    });
}

function initializeSmoothScrolling() {
    // Smooth scrolling for navigation links
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
}

function handleServiceCardClick(event) {
    const card = event.currentTarget;
    const service = card.dataset.service;
    selectService(service);
}

function handleServiceSelectChange(event) {
    const service = event.target.value;
    selectService(service);
}

function selectService(service) {
    selectedService = service;
    
    // Update service cards visual state
    serviceCards.forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.service === service) {
            card.classList.add('selected');
        }
    });
    
    // Update dropdown
    serviceSelect.value = service;
    
    // Clear any previous service error
    clearError('service');
    validateField('service');
}

function addRealTimeValidation() {
    const fields = ['fullName', 'phone', 'service', 'date', 'time', 'address'];
    
    fields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('blur', () => validateField(fieldName));
            field.addEventListener('input', () => {
                clearError(fieldName);
                if (field.value.trim()) {
                    validateField(fieldName);
                }
            });
        }
    });
}

function validateField(fieldName) {
    const field = document.getElementById(fieldName);
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldName) {
        case 'fullName':
            if (!value) {
                errorMessage = 'Full name is required';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = 'Name must be at least 2 characters long';
                isValid = false;
            } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                errorMessage = 'Name should only contain letters and spaces';
                isValid = false;
            }
            break;
            
        case 'phone':
            if (!value) {
                errorMessage = 'Phone number is required';
                isValid = false;
            } else if (!/^[0-9]{10}$/.test(value)) {
                errorMessage = 'Please enter a valid 10-digit phone number';
                isValid = false;
            }
            break;
            
        case 'service':
            if (!value) {
                errorMessage = 'Please select a service';
                isValid = false;
            }
            break;
            
        case 'date':
            if (!value) {
                errorMessage = 'Please select a date';
                isValid = false;
            } else {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    errorMessage = 'Please select a future date';
                    isValid = false;
                }
            }
            break;
            
        case 'time':
            if (!value) {
                errorMessage = 'Please select a time';
                isValid = false;
            }
            break;
            
        case 'address':
            if (!value) {
                errorMessage = 'Address is required';
                isValid = false;
            } else if (value.length < 10) {
                errorMessage = 'Please enter a complete address';
                isValid = false;
            }
            break;
    }
    
    // Update field styling and error message
    const errorElement = document.getElementById(fieldName + 'Error');
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }
    
    field.classList.remove('error', 'valid');
    if (value) {
        field.classList.add(isValid ? 'valid' : 'error');
    }
    
    return isValid;
}

function clearError(fieldName) {
    const errorElement = document.getElementById(fieldName + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    const field = document.getElementById(fieldName);
    if (field) {
        field.classList.remove('error');
    }
}

function validateForm() {
    const fields = ['fullName', 'phone', 'service', 'date', 'time', 'address'];
    let isFormValid = true;
    
    fields.forEach(fieldName => {
        const isFieldValid = validateField(fieldName);
        if (!isFieldValid) {
            isFormValid = false;
        }
    });
    
    return isFormValid;
}

function handleFormSubmission(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        // Scroll to first error
        const firstError = document.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('.submit-button');
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    
    // Get form data
    const formData = getFormData();
    
    // Send to WhatsApp
    sendToWhatsApp(formData);
    
    // Reset loading state after a short delay
    setTimeout(() => {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }, 2000);
}

function getFormData() {
    return {
        fullName: document.getElementById('fullName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        service: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        address: document.getElementById('address').value.trim()
    };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function sendToWhatsApp(formData) {
    // WhatsApp number - updated to user's specified number
    const phone = "917892783668";
    
    // Format the message
    const message = `Hello! I'd like to book a salon service.

Name: ${formData.fullName}
Phone: ${formData.phone}
Service: ${formData.service}
Date: ${formatDate(formData.date)}
Time: ${formData.time}
Address: ${formData.address}

Please confirm my appointment. Thank you!`;

    // Create WhatsApp URL
    const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappURL, '_blank');
    
    // Show success message
    showSuccessMessage();
    
    // Reset form after successful submission
    setTimeout(() => {
        resetForm();
    }, 1000);
}

function showSuccessMessage() {
    // Create and show a success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>Redirecting to WhatsApp...</span>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50, #45a049);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function resetForm() {
    // Reset form fields
    bookingForm.reset();
    
    // Clear service selection
    selectedService = '';
    serviceCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    // Clear all error messages
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    // Clear field validation classes
    const fields = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    fields.forEach(field => {
        field.classList.remove('error', 'valid');
    });
    
    // Reset minimum date
    setMinDate();
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Service Worker Registration (for PWA capabilities - optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // You can register a service worker here if needed for offline functionality
        console.log('App is ready for service worker registration if needed');
    });
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Update minimum date when user returns to the page
        setMinDate();
    }
});

// Add keyboard navigation for accessibility
document.addEventListener('keydown', (e) => {
    // Handle Enter key on service cards
    if (e.key === 'Enter' && e.target.classList.contains('service-card')) {
        e.target.click();
    }
});

// FAQ Functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => faq.classList.remove('active'));
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Modal Functionality
function initializeModals() {
    const modal = document.getElementById('authModal');
    const closeBtn = document.querySelector('.close');
    const loginLinks = document.querySelectorAll('a[href="#login"]');
    const registerLinks = document.querySelectorAll('a[href="#register"]');
    
    // Open modal for login/register links
    loginLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
            showTab('login');
        });
    });
    
    registerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
            showTab('register');
        });
    });
    
    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Tab Functionality
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    // Hide all tabs
    tabs.forEach(tab => tab.classList.remove('active'));
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
}

// Contact Form Functionality
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Show success message
            showNotification('Thank you for your message! We will get back to you soon.', 'success');
            
            // Reset form
            contactForm.reset();
        });
    }
}

// Product Add to Cart Functionality
function initializeProducts() {
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            
            // Add loading state
            btn.textContent = 'Adding...';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.textContent = 'Added to Cart';
                btn.style.background = '#4caf50';
                
                showNotification(`${productName} added to cart!`, 'success');
                
                setTimeout(() => {
                    btn.textContent = 'Add to Cart';
                    btn.style.background = '';
                    btn.disabled = false;
                }, 2000);
            }, 1000);
        });
    });
}

// Refer & Earn Functionality
function initializeReferral() {
    const shareBtn = document.querySelector('.share-btn');
    
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const referralCode = 'GLOW2025';
            const shareText = `Join GlowOnCall for premium beauty services at home! Use my referral code ${referralCode} and we both get ₹200 credit. Download now: https://glowoncall.com`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'GlowOnCall - Beauty at Your Doorstep',
                    text: shareText,
                    url: 'https://glowoncall.com'
                });
            } else {
                // Fallback to copying to clipboard
                navigator.clipboard.writeText(shareText).then(() => {
                    showNotification('Referral code copied to clipboard!', 'success');
                });
            }
        });
    }
}

// Enhanced Notification System
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    const bgColor = type === 'success' ? 'linear-gradient(135deg, #4caf50, #45a049)' : 'linear-gradient(135deg, #f44336, #d32f2f)';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 350px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Authentication Forms
function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phone = e.target.querySelector('input[type="tel"]').value;
            
            // Simulate OTP sending
            showNotification(`OTP sent to ${phone}. Please check your messages.`, 'success');
            
            // In a real app, you would send OTP here
            setTimeout(() => {
                document.getElementById('authModal').style.display = 'none';
                showNotification('Welcome back! You are now logged in.', 'success');
            }, 2000);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            // Simulate registration
            showNotification(`Account created successfully! Welcome ${data.name}!`, 'success');
            
            setTimeout(() => {
                document.getElementById('authModal').style.display = 'none';
            }, 1500);
        });
    }
}

// Page Navigation System
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-link');
    const sections = document.querySelectorAll('section');
    const serviceDetails = document.querySelectorAll('.service-detail');
    
    // Hide all service detail pages initially
    serviceDetails.forEach(section => section.classList.remove('active'));
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Remove active class from all nav links
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Handle service detail pages
            if (targetId.startsWith('service-')) {
                // Hide all sections
                sections.forEach(section => {
                    if (!section.classList.contains('service-detail')) {
                        section.style.display = 'none';
                    }
                });
                
                // Hide all service detail pages
                serviceDetails.forEach(section => section.classList.remove('active'));
                
                // Show target service detail page
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            } else {
                // Show regular sections
                serviceDetails.forEach(section => section.classList.remove('active'));
                sections.forEach(section => {
                    if (!section.classList.contains('service-detail')) {
                        section.style.display = 'block';
                    }
                });
                
                // Smooth scroll to target
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Service Booking Forms
function initializeServiceBooking() {
    const bookingForms = document.querySelectorAll('.service-booking-form');
    
    // Set minimum date for all date inputs in service forms
    const dateInputs = document.querySelectorAll('.service-booking-form input[type="date"]');
    dateInputs.forEach(input => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        input.min = formattedDate;
    });
    
    bookingForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            const serviceName = form.getAttribute('data-service');
            
            // Create WhatsApp message
            let message = `Hi! I would like to book ${serviceName}.

📝 Booking Details:
👤 Name: ${data.name}
📱 Phone: ${data.phone}
📍 Address: ${data.address}
📅 Date: ${data.date}
⏰ Time: ${data.time}
💄 Service: ${data.serviceType}`;

            // Add location link if provided
            if (data.location && data.location.trim()) {
                message += `\n🗺️ Google Maps: ${data.location}`;
            }

            message += `\n\nPlease confirm my appointment. Thank you!`;
            
            // Encode message for URL
            const encodedMessage = encodeURIComponent(message);
            
            // WhatsApp number (as specified by user)
            const phoneNumber = '917892783668';
            
            // Create WhatsApp URL
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            
            // Open WhatsApp
            window.open(whatsappUrl, '_blank');
            
            // Show success notification
            showNotification(`Redirecting to WhatsApp to confirm your ${serviceName} booking!`, 'success');
        });
    });
}

// Enhanced App Initialization
function initializeApp() {
    // Set minimum date to today
    setMinDate();
    
    // Add event listeners
    addEventListeners();
    
    // Initialize service selection
    initializeServiceSelection();
    
    // Initialize navigation system
    initializeNavigation();
    
    // Initialize service booking
    initializeServiceBooking();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize new features
    initializeFAQ();
    initializeModals();
    initializeContactForm();
    initializeProducts();
    initializeReferral();
    initializeAuthForms();
    
    // Add notification styles if not present
    addNotificationStyles();
    
    // Set home as active by default
    document.querySelector('.nav-link[href="#home"]')?.classList.add('active');
}

function addNotificationStyles() {
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }
}

// Make showTab globally accessible
window.showTab = showTab;

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
