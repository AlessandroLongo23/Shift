import { Paycheck } from '$lib/models/Paycheck.svelte';

function createPaychecksStore() {
    let paychecks = $state([]);
    let loading = $state(false);
    let error = $state(null);

    return {
        get paychecks() { return paychecks; },
        get loading() { return loading; },
        get error() { return error; },

        get sortedByDate() {
            return [...paychecks].sort((a, b) => 
                new Date(b.reference_date).getTime() - new Date(a.reference_date).getTime()
            );
        },

        get totalEarnings() {
            return paychecks.reduce((sum, p) => sum + p.net_amount + p.bonuses, 0);
        },

        async fetch() {
            loading = true;
            error = null;
            try {
                const response = await fetch('/api/paychecks');
                const result = await response.json();
                if (result.success) {
                    paychecks = result.data.map(p => new Paycheck(p));
                } else {
                    throw new Error(result.error);
                }
            } catch (e) {
                error = e.message;
                console.error('Error fetching paychecks:', e);
            } finally {
                loading = false;
            }
        },

        async create(paycheckData) {
            try {
                const response = await fetch('/api/paychecks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paycheck: paycheckData })
                });
                const result = await response.json();
                if (result.success) {
                    paychecks = [...paychecks, new Paycheck(result.data)];
                    return { success: true, data: result.data };
                }
                return { success: false, error: result.error };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        async update(id, paycheckData) {
            try {
                const response = await fetch(`/api/paychecks/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paycheck: paycheckData })
                });
                const result = await response.json();
                if (result.success) {
                    paychecks = paychecks.map(p => p.id === id ? new Paycheck(result.data) : p);
                    return { success: true, data: result.data };
                }
                return { success: false, error: result.error };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        async delete(id) {
            try {
                const response = await fetch(`/api/paychecks/${id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (result.success) {
                    paychecks = paychecks.filter(p => p.id !== id);
                    return { success: true };
                }
                return { success: false, error: result.error };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        getById(id) {
            return paychecks.find(p => p.id === id);
        },

        getByPositionId(positionId) {
            return paychecks.filter(p => p.position_id === positionId);
        },

        getByMonth(year, month) {
            return paychecks.find(p => {
                const d = new Date(p.reference_date);
                return d.getFullYear() === year && d.getMonth() === month;
            });
        }
    };
}

export const paychecksStore = createPaychecksStore();
