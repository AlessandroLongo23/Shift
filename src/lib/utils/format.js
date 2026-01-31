/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: EUR)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'EUR') {
    // Handle DKK and other Scandinavian currencies specially
    if (['DKK', 'NOK', 'SEK'].includes(currency)) {
        return new Intl.NumberFormat('da-DK', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    }
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format a date string
 * @param {string} dateString - ISO date string
 * @param {string} format - 'short' | 'full' | 'month'
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, format = 'full') {
    const date = new Date(dateString);
    
    switch (format) {
        case 'short':
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        case 'month':
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        case 'full':
        default:
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
    }
}

/**
 * Format hours as hh:mm string
 * @param {number} hours - Total hours (decimal)
 * @returns {string} Formatted hours string in hh:mm format
 */
export function formatHours(hours) {
    if (hours == null || isNaN(hours)) return '0:00';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
}

/**
 * Format a time string (HH:MM:SS or HH:MM) to HH:MM
 * @param {string} time - Time string
 * @returns {string} Formatted time as HH:MM
 */
export function formatTime(time) {
    if (!time) return '';
    // If already in HH:MM format, return as is
    // If in HH:MM:SS format, strip the seconds
    const parts = time.split(':');
    if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
    }
    return time;
}

/**
 * Calculate years of experience from positions
 * @param {Array} positions - Array of position objects
 * @returns {number} Total years of experience
 */
export function calculateTotalExperience(positions) {
    let totalMonths = 0;
    
    for (const pos of positions) {
        const start = new Date(pos.start_date);
        const end = pos.end_date ? new Date(pos.end_date) : new Date();
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        totalMonths += Math.max(1, months);
    }
    
    return Math.round((totalMonths / 12) * 10) / 10;
}
