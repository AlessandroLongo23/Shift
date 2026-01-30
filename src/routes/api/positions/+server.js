import { json } from '@sveltejs/kit';
import { Guard } from '$lib/server/guards.js';

export async function GET({ locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { data, error } = await supabase
            .from('positions')
            .select('*, companies(*)')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false });

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error fetching positions:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST({ request, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { position } = await request.json();

        const { data, error } = await supabase
            .from('positions')
            .insert({
                user_id: user.id,
                company_id: position.company_id,
                job_title: position.job_title,
                contract_type: position.contract_type,
                start_date: position.start_date,
                end_date: position.end_date || null,
                base_salary: position.base_salary || null,
                currency: position.currency || 'EUR',
                description: position.description || null,
                skills: position.skills || []
            })
            .select('*, companies(*)')
            .single();

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error creating position:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
