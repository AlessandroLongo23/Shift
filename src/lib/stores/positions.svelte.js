import { Position } from '$lib/models/Position.svelte';

function createPositionsStore() {
    let positions = $state([]);
    let loading = $state(false);
    let error = $state(null);

    return {
        get positions() { return positions; },
        get loading() { return loading; },
        get error() { return error; },

        get currentPosition() {
            return positions.find(p => p.isCurrent());
        },

        get currentPositions() {
            return positions.filter(p => p.isCurrent());
        },

        get sortedByDate() {
            return [...positions].sort((a, b) => 
                new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
            );
        },

        async fetch() {
            loading = true;
            error = null;
            try {
                const response = await fetch('/api/positions');
                const result = await response.json();
                if (result.success) {
                    positions = result.data.map(p => new Position(p));
                } else {
                    throw new Error(result.error);
                }
            } catch (e) {
                error = e.message;
                console.error('Error fetching positions:', e);
            } finally {
                loading = false;
            }
        },

        async create(positionData) {
            try {
                const response = await fetch('/api/positions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ position: positionData })
                });
                const result = await response.json();
                if (result.success) {
                    positions = [...positions, new Position(result.data)];
                    return { success: true, data: result.data };
                }
                return { success: false, error: result.error };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        async update(id, positionData) {
            try {
                const response = await fetch(`/api/positions/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ position: positionData })
                });
                const result = await response.json();
                if (result.success) {
                    positions = positions.map(p => p.id === id ? new Position(result.data) : p);
                    return { success: true, data: result.data };
                }
                return { success: false, error: result.error };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        async delete(id) {
            try {
                const response = await fetch(`/api/positions/${id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (result.success) {
                    positions = positions.filter(p => p.id !== id);
                    return { success: true };
                }
                return { success: false, error: result.error };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        getById(id) {
            return positions.find(p => p.id === id);
        },

        getByCompanyId(companyId) {
            return positions.filter(p => p.company_id === companyId);
        }
    };
}

export const positionsStore = createPositionsStore();
