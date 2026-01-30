import { Company } from '$lib/models/Company.svelte';

function createCompaniesStore() {
    let companies = $state([]);
    let loading = $state(false);
    let error = $state(null);

    return {
        get companies() { return companies; },
        get loading() { return loading; },
        get error() { return error; },

        async fetch() {
            loading = true;
            error = null;
            try {
                const response = await fetch('/api/companies');
                const result = await response.json();
                if (result.success) {
                    companies = result.data.map(c => new Company(c));
                } else {
                    throw new Error(result.error);
                }
            } catch (e) {
                error = e.message;
                console.error('Error fetching companies:', e);
            } finally {
                loading = false;
            }
        },

        async create(companyData) {
            try {
                const response = await fetch('/api/companies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ company: companyData })
                });
                const result = await response.json();
                if (result.success) {
                    companies = [...companies, new Company(result.data)];
                    return { success: true, data: result.data };
                }
                return { success: false, error: result.error };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        async update(id, companyData) {
            try {
                const response = await fetch(`/api/companies/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ company: companyData })
                });
                const result = await response.json();
                if (result.success) {
                    companies = companies.map(c => c.id === id ? new Company(result.data) : c);
                    return { success: true, data: result.data };
                }
                return { success: false, error: result.error };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        async delete(id) {
            try {
                const response = await fetch(`/api/companies/${id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (result.success) {
                    companies = companies.filter(c => c.id !== id);
                    return { success: true };
                }
                return { success: false, error: result.error };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        getById(id) {
            return companies.find(c => c.id === id);
        }
    };
}

export const companiesStore = createCompaniesStore();
