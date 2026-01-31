import { settingsStore } from '$lib/stores/settings.js';

/**
 * Get the pay period for a given year and month
 * @param {number} year - The year
 * @param {number} month - The month (0-indexed)
 * @returns {{ startDate: Date, endDate: Date }}
 */
export function getPayPeriod(year, month) {
    return settingsStore.getPayPeriod(year, month);
}

/**
 * Filter work logs that fall within a specific pay period
 * @param {Array} workLogs - Array of work logs
 * @param {number} year - The reference year
 * @param {number} month - The reference month (0-indexed)
 * @param {Object} options - Filter options
 * @param {string} [options.type] - Filter by work log type (e.g., 'work', 'vacation')
 * @returns {Array} Filtered work logs
 */
export function getLogsInPayPeriod(workLogs, year, month, options = {}) {
    const { startDate, endDate } = getPayPeriod(year, month);
    
    // Normalize dates for comparison
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return workLogs.filter(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        
        const inPeriod = logDate >= start && logDate <= end;
        
        if (!inPeriod) return false;
        if (options.type && log.type !== options.type) return false;
        
        return true;
    });
}

/**
 * Calculate total hours for a pay period
 * @param {Array} workLogs - Array of work logs
 * @param {number} year - The reference year
 * @param {number} month - The reference month (0-indexed)
 * @param {string} [type] - Optional: only count hours for this type
 * @returns {number} Total hours
 */
export function getTotalHoursInPeriod(workLogs, year, month, type = null) {
    const logs = getLogsInPayPeriod(workLogs, year, month, type ? { type } : {});
    return logs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);
}

/**
 * Calculate period statistics
 * @param {Array} workLogs - Array of work logs
 * @param {number} year - The reference year
 * @param {number} month - The reference month (0-indexed)
 * @returns {Object} Stats object with totalHours, workDays, vacationDays, etc.
 */
export function getPeriodStats(workLogs, year, month) {
    const periodLogs = getLogsInPayPeriod(workLogs, year, month);
    
    return {
        totalHours: periodLogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0),
        workDays: periodLogs.filter(log => log.type === 'work').length,
        vacationDays: periodLogs.filter(log => log.type === 'vacation').length,
        sickDays: periodLogs.filter(log => log.type === 'sick_leave').length,
        permitDays: periodLogs.filter(log => log.type === 'permit').length,
        totalLogs: periodLogs.length
    };
}

/**
 * Get the month reference (year, month) for a given paycheck
 * This extracts the year and month from the paycheck's reference_date
 * @param {Object} paycheck - The paycheck object
 * @returns {{ year: number, month: number }}
 */
export function getPaycheckPeriodRef(paycheck) {
    const date = new Date(paycheck.reference_date);
    return {
        year: date.getFullYear(),
        month: date.getMonth()
    };
}

/**
 * Calculate hourly rate for a paycheck based on the corresponding pay period hours
 * @param {Object} paycheck - The paycheck object
 * @param {Array} workLogs - Array of work logs
 * @param {Function} currencyConverter - Optional function to convert currency (amount, fromCurrency) => convertedAmount
 * @param {Function} getCurrency - Function to get currency for a paycheck (paycheck) => currencyCode
 * @returns {Object} Object with hours, netAmount, rate
 */
export function calculatePaycheckHourlyRate(paycheck, workLogs, currencyConverter = null, getCurrency = null) {
    const { year, month } = getPaycheckPeriodRef(paycheck);
    const totalHours = getTotalHoursInPeriod(workLogs, year, month, 'work');
    
    let netAmount = paycheck.net_amount;
    let currency = 'EUR';
    
    if (getCurrency) {
        currency = getCurrency(paycheck);
    }
    
    if (currencyConverter) {
        netAmount = currencyConverter(paycheck.net_amount, currency);
    }
    
    const hourlyRate = totalHours > 0 ? netAmount / totalHours : 0;
    
    return {
        hours: totalHours,
        netAmount,
        rate: hourlyRate,
        currency
    };
}

/**
 * Format a pay period as a human-readable string
 * @param {number} year - The year
 * @param {number} month - The month (0-indexed)
 * @param {Object} options - Formatting options
 * @returns {string} Formatted period string
 */
export function formatPayPeriod(year, month, options = {}) {
    const { startDate, endDate } = getPayPeriod(year, month);
    const formatOpts = { 
        month: options.monthFormat || 'short', 
        day: 'numeric', 
        year: options.showYear !== false ? 'numeric' : undefined 
    };
    
    const startStr = startDate.toLocaleDateString('en-US', formatOpts);
    const endStr = endDate.toLocaleDateString('en-US', formatOpts);
    
    return `${startStr} - ${endStr}`;
}

/**
 * Check if a date falls within a pay period
 * @param {Date|string} date - The date to check
 * @param {number} year - The reference year
 * @param {number} month - The reference month (0-indexed)
 * @returns {boolean}
 */
export function isDateInPayPeriod(date, year, month) {
    return settingsStore.isInPayPeriod(date, year, month);
}
