import { WorkLog } from '$lib/models/WorkLog.svelte';

function createWorkLogsStore() {
    let workLogs = $state([]);
    let loading = $state(false);
    let error = $state(null);

    return {
        get workLogs() { return workLogs; },
        get loading() { return loading; },
        get error() { return error; },

        async fetch(year, month) {
            loading = true;
            error = null;
            try {
                const params = new URLSearchParams();
                if (year) params.append('year', year);
                if (month) params.append('month', month);
                
                const response = await fetch(`/api/work-logs?${params}`);
                const result = await response.json();
                if (result.success) {
                    workLogs = result.data.map(w => new WorkLog(w));
                } else {
                    throw new Error(result.error);
                }
            } catch (e) {
                error = e.message;
                console.error('Error fetching work logs:', e);
            } finally {
                loading = false;
            }
        },

        async create(workLogData) {
            try {
                const response = await fetch('/api/work-logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ workLog: workLogData })
                });
                const result = await response.json();
                if (result.success) {
                    workLogs = [...workLogs, new WorkLog(result.data)];
                    return { success: true, data: result.data };
                }
                return { success: false, error: result.error };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        async update(id, workLogData) {
            try {
                const response = await fetch(`/api/work-logs/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ workLog: workLogData })
                });
                const result = await response.json();
                if (result.success) {
                    workLogs = workLogs.map(w => w.id === id ? new WorkLog(result.data) : w);
                    return { success: true, data: result.data };
                }
                return { success: false, error: result.error };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        async delete(id) {
            try {
                const response = await fetch(`/api/work-logs/${id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (result.success) {
                    workLogs = workLogs.filter(w => w.id !== id);
                    return { success: true };
                }
                return { success: false, error: result.error };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        getByDate(date) {
            return workLogs.find(w => w.date === date);
        },

        getByPositionId(positionId) {
            return workLogs.filter(w => w.position_id === positionId);
        },

        getTotalHoursForMonth(year, month) {
            return workLogs
                .filter(w => {
                    const d = new Date(w.date);
                    return d.getFullYear() === year && d.getMonth() === month;
                })
                .reduce((sum, w) => sum + w.hours_worked, 0);
        }
    };
}

export const workLogsStore = createWorkLogsStore();
