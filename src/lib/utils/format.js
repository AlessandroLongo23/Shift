import { Currency } from "$lib/const/currency";

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: EUR)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = Currency.EURO) {
    // Handle DKK and other Scandinavian currencies specially
    if ([Currency.DKK].includes(currency)) {
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
    return `${h} h ${m.toString().padStart(2, '0')} m`;
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
 * Format a Date object as a local "YYYY-MM-DD" string without UTC conversion.
 * Using toISOString() on local-midnight dates shifts to the previous day in UTC+ timezones.
 * @param {Date} date
 * @returns {string} e.g. "2025-07-01"
 */
export function toLocalDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Calculate years of experience from positions
 * @param {Array} positions - Array of position objects
 * @returns {string} Total experience formatted as "Xy Xm"
 */
export function calculateTotalExperience(positions) {
    let totalMonths = 0;
    const today = new Date();

    for (const pos of positions) {
        const start = new Date(pos.start_date);
        if (start > today) continue; // skip future positions

        const rawEnd = pos.end_date ? new Date(pos.end_date) : today;
        const end = rawEnd > today ? today : rawEnd; // cap at today
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        totalMonths += Math.max(1, months);
    }

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    if (years === 0) return `${months} months`;
    if (months === 0) return `${years} years`;
    return `${years} y ${months} m`;
}
