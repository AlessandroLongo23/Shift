/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: EUR)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('it-IT', {
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
 * Format hours as a readable string
 * @param {number} hours - Total hours
 * @returns {string} Formatted hours string
 */
export function formatHours(hours) {
    if (hours < 1) {
        return `${Math.round(hours * 60)}m`;
    }
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
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
