// API Service for SkillSync Frontend-Backend Communication
class APIService {
    constructor() {
        this.baseURL = window.location.origin;
        this.token = localStorage.getItem('token');
    }

    // Helper method to make HTTP requests
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        // Add authorization header if token exists
        if (this.token) {
            defaultHeaders['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            headers: { ...defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(email, password) {
        const data = await this.makeRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        // Store token if login successful
        if (data.token) {
            this.token = data.token;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    }

    async signup(userData) {
        return await this.makeRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async logout() {
        try {
            await this.makeRequest('/api/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            // Clear local storage regardless of API call success
            this.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    // User methods
    async getCurrentUser() {
        return await this.makeRequest('/api/auth/me');
    }

    async updateProfile(userData) {
        return await this.makeRequest('/api/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // Dashboard methods
    async getDashboardStats() {
        return await this.makeRequest('/api/users/dashboard');
    }

    async getUpcomingSessions() {
        return await this.makeRequest('/api/users/upcoming-sessions');
    }

    async getRecentActivity() {
        return await this.makeRequest('/api/users/recent-activity');
    }

    // Tutor methods
    async getTutors() {
        return await this.makeRequest('/api/tutors');
    }

    async getTutorById(id) {
        return await this.makeRequest(`/api/tutors/${id}`);
    }

    // Booking methods
    async createBooking(bookingData) {
        return await this.makeRequest('/api/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }

    async getBookings(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/api/bookings?${queryString}` : '/api/bookings';
        return await this.makeRequest(endpoint);
    }

    async getBookingById(bookingId) {
        return await this.makeRequest(`/api/bookings/${bookingId}`);
    }

    async updateBookingStatus(bookingId, status, message = '') {
        return await this.makeRequest(`/api/bookings/${bookingId}`, {
            method: 'PUT',
            body: JSON.stringify({ status, message })
        });
    }

    async getTutorAvailability(tutorId, date) {
        return await this.makeRequest(`/api/bookings/availability?tutorId=${tutorId}&date=${date}`);
    }

    // Rating methods
    async submitRating(bookingId, rating, review = '') {
        return await this.makeRequest('/api/ratings', {
            method: 'POST',
            body: JSON.stringify({ bookingId, rating, review })
        });
    }

    async getRatings(tutorId = null) {
        const endpoint = tutorId ? `/api/ratings?tutorId=${tutorId}` : '/api/ratings';
        return await this.makeRequest(endpoint);
    }

    async getTutorRatingStats(tutorId) {
        return await this.makeRequest(`/api/ratings/tutor/${tutorId}/stats`);
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token && !!localStorage.getItem('user');
    }

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }
}

// Create global API instance
window.api = new APIService();

// Authentication helper functions
window.auth = {
    // Redirect to login if not authenticated
    requireAuth() {
        if (!api.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },

    // Redirect to dashboard if already authenticated
    redirectIfAuthenticated() {
        if (api.isAuthenticated()) {
            window.location.href = '/dashboard.html';
            return true;
        }
        return false;
    },

    // Logout and redirect to login
    async logout() {
        await api.logout();
        window.location.href = '/login.html';
    }
};