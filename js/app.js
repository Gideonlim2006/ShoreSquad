/**
 * ShoreSquad Web Application
 * Interactive features for beach cleanup community platform
 */

// ===================================
// GLOBAL VARIABLES & CONFIGURATION
// ===================================

const CONFIG = {
    WEATHER_API_KEY: 'demo_key', // Replace with actual OpenWeatherMap API key
    WEATHER_API_URL: 'https://api.openweathermap.org/data/2.5/weather',
    GEOLOCATION_TIMEOUT: 10000,
    ANIMATION_DURATION: 300,
    SCROLL_THRESHOLD: 200
};

// Application state
const appState = {
    currentLocation: null,
    weatherData: null,
    events: [],
    filteredEvents: [],
    isLoading: false,
    activeFilter: 'all'
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Debounce function to limit rapid function calls
 */
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

/**
 * Show loading spinner
 */
function showLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('visible');
        spinner.setAttribute('aria-hidden', 'false');
        appState.isLoading = true;
    }
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.remove('visible');
        spinner.setAttribute('aria-hidden', 'true');
        appState.isLoading = false;
    }
}

/**
 * Show error message to user
 */
function showError(message, container = 'body') {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
            <span>${message}</span>
            <button class="error-close" onclick="this.parentElement.parentElement.remove()" aria-label="Close error message">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        </div>
    `;
    
    // Add error styles if not already added
    if (!document.querySelector('#error-styles')) {
        const style = document.createElement('style');
        style.id = 'error-styles';
        style.textContent = `
            .error-notification {
                position: fixed;
                top: 90px;
                right: 20px;
                background: #dc3545;
                color: white;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1060;
                animation: slideInRight 0.3s ease-out;
                max-width: 400px;
            }
            .error-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .error-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                margin-left: auto;
                padding: 0.25rem;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(errorDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

/**
 * Smooth scroll to element
 */
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const elementPosition = element.offsetTop - navHeight - 20;
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Scroll to top function
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * Join next cleanup event function
 */
function joinNextCleanup() {
    // Show confirmation dialog
    const confirmed = confirm(
        "🌊 Ready to join the Pasir Ris Beach cleanup?\n\n" +
        "📅 Date: Next Weekend\n" +
        "⏰ Time: 9:00 AM - 12:00 PM\n" +
        "📍 Location: Pasir Ris Beach, Singapore\n\n" +
        "We'll send you reminder notifications and cleanup kit details. Continue?"
    );
    
    if (confirmed) {
        // Simulate registration process
        showNotification('success', '🎉 Welcome to the squad! Registration confirmed for Pasir Ris Beach cleanup.');
        
        // Update UI to show registered state
        const joinButton = document.querySelector('.next-location .btn-primary');
        if (joinButton) {
            joinButton.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Registered!';
            joinButton.style.background = 'var(--success)';
            joinButton.disabled = true;
            
            // Reset button after 3 seconds for demo purposes
            setTimeout(() => {
                joinButton.innerHTML = '<i class="fas fa-hand-paper" aria-hidden="true"></i> Join This Cleanup';
                joinButton.style.background = '';
                joinButton.disabled = false;
            }, 3000);
        }
        
        // Scroll to contact section for more info
        setTimeout(() => {
            scrollToSection('contact');
        }, 1500);
    }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Get user's current location
 */
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: CONFIG.GEOLOCATION_TIMEOUT,
            maximumAge: 300000 // 5 minutes
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                appState.currentLocation = location;
                resolve(location);
            },
            (error) => {
                let message = 'Unable to get your location.';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location access denied by user.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out.';
                        break;
                }
                reject(new Error(message));
            },
            options
        );
    });
}

// ===================================
// NAVIGATION FUNCTIONALITY
// ===================================

/**
 * Initialize navigation
 */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            
            // Animate hamburger
            navToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.classList.remove('active');
            }
        });
    });

    // Handle scroll for navbar background
    const navbar = document.querySelector('.navbar');
    const debouncedScroll = debounce(() => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }, 10);

    window.addEventListener('scroll', debouncedScroll);
}

// ===================================
// WEATHER FUNCTIONALITY
// ===================================

/**
 * Fetch weather data from API
 */
async function fetchWeatherData(location) {
    try {
        let url;
        
        // If location is coordinates
        if (typeof location === 'object' && location.lat && location.lon) {
            url = `${CONFIG.WEATHER_API_URL}?lat=${location.lat}&lon=${location.lon}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`;
        } 
        // If location is city name
        else if (typeof location === 'string') {
            url = `${CONFIG.WEATHER_API_URL}?q=${encodeURIComponent(location)}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`;
        } else {
            throw new Error('Invalid location format');
        }

        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Weather service unavailable. Please try again later.');
            }
            throw new Error(`Weather data not found for this location.`);
        }

        const data = await response.json();
        appState.weatherData = data;
        return data;
    } catch (error) {
        console.error('Weather fetch error:', error);
        throw error;
    }
}

/**
 * Display weather data
 */
function displayWeather(weatherData) {
    const weatherDisplay = document.getElementById('weather-display');
    if (!weatherDisplay || !weatherData) return;

    const temperature = Math.round(weatherData.main.temp);
    const condition = weatherData.weather[0].description;
    const humidity = weatherData.main.humidity;
    const windSpeed = Math.round(weatherData.wind.speed * 3.6); // Convert m/s to km/h
    const visibility = weatherData.visibility ? Math.round(weatherData.visibility / 1000) : 'N/A';
    const location = weatherData.name + (weatherData.sys.country ? `, ${weatherData.sys.country}` : '');

    // Determine cleanup suitability
    const isGoodForCleanup = temperature > 5 && temperature < 35 && windSpeed < 25 && humidity < 80;
    const suitabilityClass = isGoodForCleanup ? 'good' : 'poor';
    const suitabilityText = isGoodForCleanup ? 'Great for cleanup!' : 'Check conditions';

    weatherDisplay.innerHTML = `
        <div class="weather-current">
            <h3>${location}</h3>
            <div class="weather-temp">${temperature}°C</div>
            <div class="weather-condition">${condition.charAt(0).toUpperCase() + condition.slice(1)}</div>
            <div class="cleanup-suitability ${suitabilityClass}">
                <i class="fas ${isGoodForCleanup ? 'fa-check-circle' : 'fa-exclamation-triangle'}" aria-hidden="true"></i>
                ${suitabilityText}
            </div>
        </div>
        <div class="weather-details">
            <div class="weather-detail">
                <div class="weather-detail-label">Humidity</div>
                <div class="weather-detail-value">${humidity}%</div>
            </div>
            <div class="weather-detail">
                <div class="weather-detail-label">Wind Speed</div>
                <div class="weather-detail-value">${windSpeed} km/h</div>
            </div>
            <div class="weather-detail">
                <div class="weather-detail-label">Visibility</div>
                <div class="weather-detail-value">${visibility} km</div>
            </div>
            <div class="weather-detail">
                <div class="weather-detail-label">Feels Like</div>
                <div class="weather-detail-value">${Math.round(weatherData.main.feels_like)}°C</div>
            </div>
        </div>
    `;

    // Add cleanup suitability styles if not already added
    if (!document.querySelector('#weather-styles')) {
        const style = document.createElement('style');
        style.id = 'weather-styles';
        style.textContent = `
            .cleanup-suitability {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-weight: 600;
                margin-top: 1rem;
                justify-content: center;
            }
            .cleanup-suitability.good {
                background: rgba(32, 178, 170, 0.2);
                color: #20B2AA;
            }
            .cleanup-suitability.poor {
                background: rgba(255, 140, 0, 0.2);
                color: #FF8C00;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Get weather for user input location
 */
async function getWeather() {
    const locationInput = document.getElementById('location-input');
    const location = locationInput.value.trim();
    
    if (!location) {
        // Try to get current location
        try {
            showLoading();
            const coords = await getCurrentLocation();
            const weatherData = await fetchWeatherData(coords);
            displayWeather(weatherData);
            locationInput.value = weatherData.name;
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
        return;
    }

    try {
        showLoading();
        const weatherData = await fetchWeatherData(location);
        displayWeather(weatherData);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Initialize weather functionality
 */
function initWeather() {
    const locationInput = document.getElementById('location-input');
    
    if (locationInput) {
        // Handle Enter key press
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                getWeather();
            }
        });

        // Try to get current location weather on load
        getCurrentLocation()
            .then(coords => fetchWeatherData(coords))
            .then(weatherData => {
                displayWeather(weatherData);
                locationInput.placeholder = `Weather for ${weatherData.name}`;
            })
            .catch(error => {
                console.log('Could not get current location weather:', error.message);
                // Display demo weather data
                displayDemoWeather();
            });
    }
}

/**
 * Display demo weather data when API is not available
 */
function displayDemoWeather() {
    const demoWeather = {
        name: 'Santa Monica',
        sys: { country: 'US' },
        main: {
            temp: 22,
            feels_like: 24,
            humidity: 65
        },
        weather: [{ description: 'partly cloudy' }],
        wind: { speed: 3.5 },
        visibility: 10000
    };
    
    displayWeather(demoWeather);
}

// ===================================
// EVENTS FUNCTIONALITY
// ===================================

/**
 * Sample event data
 */
const sampleEvents = [
    {
        id: 1,
        title: 'Santa Monica Beach Cleanup',
        date: '2025-06-15',
        time: '09:00',
        location: 'Santa Monica Beach, CA',
        description: 'Join us for our weekly beach cleanup! We provide all supplies and refreshments.',
        participants: 24,
        maxParticipants: 40,
        difficulty: 'easy',
        organizer: 'LA Coast Squad',
        image: null
    },
    {
        id: 2,
        title: 'Malibu Rocky Shore Challenge',
        date: '2025-06-16',
        time: '07:30',
        location: 'Malibu Point, CA',
        description: 'Advanced cleanup focusing on rocky areas and tidal pools. Experience recommended.',
        participants: 12,
        maxParticipants: 20,
        difficulty: 'hard',
        organizer: 'Malibu Eco Warriors',
        image: null
    },
    {
        id: 3,
        title: 'Family-Friendly Venice Cleanup',
        date: '2025-06-17',
        time: '10:00',
        location: 'Venice Beach, CA',
        description: 'Perfect for families! Educational activities for kids while we clean the beach.',
        participants: 31,
        maxParticipants: 50,
        difficulty: 'easy',
        organizer: 'Venice Green Team',
        image: null
    },
    {
        id: 4,
        title: 'Manhattan Beach Morning Mission',
        date: '2025-06-18',
        time: '08:00',
        location: 'Manhattan Beach, CA',
        description: 'Early morning cleanup followed by optional beach volleyball and coffee.',
        participants: 18,
        maxParticipants: 30,
        difficulty: 'medium',
        organizer: 'South Bay Squad',
        image: null
    },
    {
        id: 5,
        title: 'Redondo Beach Pier Cleanup',
        date: '2025-06-19',
        time: '09:30',
        location: 'Redondo Beach Pier, CA',
        description: 'Focus on pier area and surrounding beach. Great for beginners!',
        participants: 22,
        maxParticipants: 35,
        difficulty: 'easy',
        organizer: 'Redondo Eco Squad',
        image: null
    },
    {
        id: 6,
        title: 'El Segundo Beach Restoration',
        date: '2025-06-21',
        time: '08:30',
        location: 'El Segundo Beach, CA',
        description: 'Comprehensive cleanup and dune restoration project. Tools provided.',
        participants: 8,
        maxParticipants: 25,
        difficulty: 'medium',
        organizer: 'South Coast Guardians',
        image: null
    }
];

/**
 * Load and display events
 */
function loadEvents() {
    appState.events = sampleEvents;
    appState.filteredEvents = [...sampleEvents];
    displayEvents();
}

/**
 * Display events in the grid
 */
function displayEvents() {
    const eventsContainer = document.getElementById('events-container');
    if (!eventsContainer) return;

    if (appState.filteredEvents.length === 0) {
        eventsContainer.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-times" aria-hidden="true"></i>
                <h3>No events found</h3>
                <p>Try adjusting your filter or check back later for new cleanup events!</p>
            </div>
        `;
        return;
    }

    eventsContainer.innerHTML = appState.filteredEvents.map(event => {
        const eventDate = new Date(event.date + 'T' + event.time);
        const isToday = eventDate.toDateString() === new Date().toDateString();
        const isPast = eventDate < new Date();
        
        return `
            <article class="event-card ${isPast ? 'past-event' : ''}" data-event-id="${event.id}">
                <header class="event-header">
                    <div class="event-date">
                        <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                        ${formatDate(event.date)} ${isToday ? '(Today!)' : ''}
                    </div>
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                        ${event.location}
                    </div>
                </header>
                <div class="event-body">
                    <p class="event-description">${event.description}</p>
                    <div class="event-meta">
                        <div class="event-participants">
                            <i class="fas fa-users" aria-hidden="true"></i>
                            <span>${event.participants}/${event.maxParticipants} participants</span>
                        </div>
                        <span class="event-difficulty difficulty-${event.difficulty}">${event.difficulty}</span>
                    </div>
                    <div class="event-actions">
                        <button class="btn ${isPast ? 'btn-outline' : 'btn-primary'}" 
                                onclick="${isPast ? 'viewEventDetails' : 'joinEvent'}(${event.id})"
                                ${event.participants >= event.maxParticipants && !isPast ? 'disabled' : ''}>
                            <i class="fas fa-${isPast ? 'eye' : event.participants >= event.maxParticipants ? 'exclamation-triangle' : 'hand-peace'}" aria-hidden="true"></i>
                            ${isPast ? 'View Details' : 
                              event.participants >= event.maxParticipants ? 'Event Full' : 'Join Cleanup'}
                        </button>
                        <button class="btn btn-outline" onclick="shareEvent(${event.id})" aria-label="Share event">
                            <i class="fas fa-share-alt" aria-hidden="true"></i>
                            Share
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

/**
 * Filter events based on selected filter
 */
function filterEvents(filter) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    
    // Get next Saturday and Sunday
    const daysUntilSaturday = (6 - today.getDay()) % 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    const nextSunday = new Date(nextSaturday);
    nextSunday.setDate(nextSaturday.getDate() + 1);

    appState.filteredEvents = appState.events.filter(event => {
        const eventDate = new Date(event.date);
        
        switch(filter) {
            case 'today':
                return eventDate.toDateString() === today.toDateString();
            case 'weekend':
                return eventDate.toDateString() === nextSaturday.toDateString() || 
                       eventDate.toDateString() === nextSunday.toDateString();
            case 'week':
                return eventDate >= today && eventDate <= weekFromNow;
            default:
                return true;
        }
    });

    appState.activeFilter = filter;
    displayEvents();

    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
}

/**
 * Initialize events functionality
 */
function initEvents() {
    // Load initial events
    loadEvents();

    // Set up filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            filterEvents(filter);
        });
    });
}

/**
 * Join event functionality
 */
function joinEvent(eventId) {
    const event = appState.events.find(e => e.id === eventId);
    if (!event) return;

    if (event.participants >= event.maxParticipants) {
        showError('Sorry, this event is already full!');
        return;
    }

    // Simulate joining
    event.participants++;
    displayEvents();
    
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            <span>Successfully joined "${event.title}"! Check your email for details.</span>
            <button class="success-close" onclick="this.parentElement.parentElement.remove()" aria-label="Close success message">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        </div>
    `;
    
    // Add success styles if not already added
    if (!document.querySelector('#success-styles')) {
        const style = document.createElement('style');
        style.id = 'success-styles';
        style.textContent = `
            .success-notification {
                position: fixed;
                top: 90px;
                right: 20px;
                background: #20B2AA;
                color: white;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1060;
                animation: slideInRight 0.3s ease-out;
                max-width: 400px;
            }
            .success-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .success-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                margin-left: auto;
                padding: 0.25rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(successDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (successDiv.parentElement) {
            successDiv.remove();
        }
    }, 5000);
}

/**
 * View event details
 */
function viewEventDetails(eventId) {
    const event = appState.events.find(e => e.id === eventId);
    if (!event) return;
    
    showError(`Event details for "${event.title}" would open here. Feature coming soon!`);
}

/**
 * Share event functionality
 */
function shareEvent(eventId) {
    const event = appState.events.find(e => e.id === eventId);
    if (!event) return;

    const shareText = `Join me at "${event.title}" on ${formatDate(event.date)} in ${event.location}! 🌊♻️ #ShoreSquad #BeachCleanup`;
    const shareUrl = `${window.location.origin}/?event=${eventId}`;

    // Try native Web Share API first
    if (navigator.share) {
        navigator.share({
            title: event.title,
            text: shareText,
            url: shareUrl
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
            .then(() => {
                showError('Event link copied to clipboard! Share it with your friends.', 'success');
            })
            .catch(() => {
                showError('Unable to copy to clipboard. Please copy the URL manually.');
            });
    }
}

/**
 * Load more events (pagination simulation)
 */
function loadMoreEvents() {
    // Simulate loading more events
    const additionalEvents = [
        {
            id: 7,
            title: 'Hermosa Beach Dawn Patrol',
            date: '2025-06-22',
            time: '06:30',
            location: 'Hermosa Beach, CA',
            description: 'Early bird cleanup for the dedicated! Watch the sunrise while making a difference.',
            participants: 5,
            maxParticipants: 15,
            difficulty: 'medium',
            organizer: 'Dawn Patrol Squad',
            image: null
        },
        {
            id: 8,
            title: 'Torrance Beach Community Day',
            date: '2025-06-23',
            time: '11:00',
            location: 'Torrance Beach, CA',
            description: 'Family event with BBQ lunch included! Perfect for first-time volunteers.',
            participants: 15,
            maxParticipants: 60,
            difficulty: 'easy',
            organizer: 'Torrance Green Initiative',
            image: null
        }
    ];

    appState.events.push(...additionalEvents);
    
    // Re-apply current filter
    filterEvents(appState.activeFilter);
}

// ===================================
// COMMUNITY STATS ANIMATION
// ===================================

/**
 * Animate counter numbers
 */
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.dataset.count);
        const duration = 2000; // 2 seconds
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    };

    // Intersection Observer for triggering animation when in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.7 });

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// ===================================
// FORM HANDLING
// ===================================

/**
 * Initialize contact form
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validateForm(form)) {
            await submitForm(form);
        }
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

/**
 * Validate form fields
 */
function validateForm(form) {
    const fields = ['name', 'email', 'subject', 'message'];
    let isValid = true;

    fields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!validateField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Validate individual field
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let errorMessage = '';

    // Clear previous error
    clearFieldError(field);

    // Validation rules
    switch(fieldName) {
        case 'name':
            if (!value) {
                errorMessage = 'Name is required';
            } else if (value.length < 2) {
                errorMessage = 'Name must be at least 2 characters';
            }
            break;
        
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                errorMessage = 'Email is required';
            } else if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email address';
            }
            break;
        
        case 'subject':
            if (!value) {
                errorMessage = 'Please select a subject';
            }
            break;
        
        case 'message':
            if (!value) {
                errorMessage = 'Message is required';
            } else if (value.length < 10) {
                errorMessage = 'Message must be at least 10 characters';
            }
            break;
    }

    if (errorMessage) {
        showFieldError(field, errorMessage);
        return false;
    }

    return true;
}

/**
 * Show field error
 */
function showFieldError(field, message) {
    field.classList.add('error');
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * Clear field error
 */
function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

/**
 * Submit contact form
 */
async function submitForm(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    try {
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...';
        submitButton.disabled = true;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Success
        submitButton.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Message Sent!';
        submitButton.style.background = '#20B2AA';
        
        // Reset form
        form.reset();
        
        // Show success message
        showError('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
        
        // Reset button after delay
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            submitButton.style.background = '';
        }, 3000);

    } catch (error) {
        // Error handling
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        showError('Sorry, there was an error sending your message. Please try again.');
    }
}

// ===================================
// SCROLL EFFECTS
// ===================================

/**
 * Initialize scroll effects
 */
function initScrollEffects() {
    const backToTopButton = document.querySelector('.back-to-top');
    
    const debouncedScroll = debounce(() => {
        // Back to top button visibility
        if (window.scrollY > CONFIG.SCROLL_THRESHOLD) {
            backToTopButton?.classList.add('visible');
        } else {
            backToTopButton?.classList.remove('visible');
        }
    }, 10);

    window.addEventListener('scroll', debouncedScroll);

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .event-card, .testimonial').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===================================
// ACCESSIBILITY ENHANCEMENTS
// ===================================

/**
 * Initialize accessibility features
 */
function initAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#home';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link sr-only';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary);
        color: white;
        padding: 8px;
        border-radius: 4px;
        text-decoration: none;
        z-index: 1000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
        skipLink.classList.remove('sr-only');
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
        skipLink.classList.add('sr-only');
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Escape key to close mobile menu
        if (e.key === 'Escape') {
            const navMenu = document.querySelector('.nav-menu');
            const navToggle = document.querySelector('.nav-toggle');
            if (navMenu?.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle?.setAttribute('aria-expanded', 'false');
                navToggle?.focus();
            }
        }
    });

    // Focus management for modals and overlays
    document.addEventListener('focusin', (e) => {
        // Ensure focus stays within modal if one is open
        // This would be expanded for actual modal implementation
    });
}

// ===================================
// PERFORMANCE OPTIMIZATIONS
// ===================================

/**
 * Initialize performance optimizations
 */
function initPerformanceOptimizations() {
    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Preload critical resources
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap';
    preloadLink.as = 'style';
    document.head.appendChild(preloadLink);
}

// ===================================
// LOCAL STORAGE MANAGEMENT
// ===================================

/**
 * Save user preferences to localStorage
 */
function saveUserPreferences() {
    const preferences = {
        lastLocation: appState.currentLocation,
        favoriteEvents: [], // Would be populated with user favorites
        theme: 'light', // For future dark mode
        notifications: true
    };
    
    try {
        localStorage.setItem('shoresquad_preferences', JSON.stringify(preferences));
    } catch (error) {
        console.warn('Could not save user preferences:', error);
    }
}

/**
 * Load user preferences from localStorage
 */
function loadUserPreferences() {
    try {
        const saved = localStorage.getItem('shoresquad_preferences');
        if (saved) {
            const preferences = JSON.parse(saved);
            appState.currentLocation = preferences.lastLocation;
            return preferences;
        }
    } catch (error) {
        console.warn('Could not load user preferences:', error);
    }
    return null;
}

// ===================================
// ERROR BOUNDARY & MONITORING
// ===================================

/**
 * Global error handler
 */
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    
    // In production, you might want to send errors to a monitoring service
    // Analytics.trackError(e.error);
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    e.preventDefault(); // Prevent the default browser behavior
});

// ===================================
// MAIN INITIALIZATION
// ===================================

/**
 * Initialize the application
 */
function initApp() {
    try {
        // Load user preferences
        loadUserPreferences();
        
        // Initialize all components
        initNavigation();
        initWeather();
        initEvents();
        initContactForm();
        initScrollEffects();
        initAccessibility();
        initPerformanceOptimizations();
        animateCounters();
        
        // Save preferences on page unload
        window.addEventListener('beforeunload', saveUserPreferences);
        
        console.log('🌊 ShoreSquad app initialized successfully!');
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('App initialization failed. Please refresh the page.');
    }
}

// ===================================
// DOM READY & EVENT LISTENERS
// ===================================

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Handle page visibility changes (for performance)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is now hidden, pause any heavy operations
        console.log('App paused - page hidden');
    } else {
        // Page is now visible, resume operations
        console.log('App resumed - page visible');
    }
});

// Service Worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for global access
window.ShoreSquad = {
    scrollToSection,
    scrollToTop,
    getWeather,
    joinEvent,
    shareEvent,
    loadMoreEvents,
    viewEventDetails
};
