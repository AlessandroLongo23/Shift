import { json } from '@sveltejs/kit';
import { Guard } from '$lib/server/guards.js';

export async function GET({ params, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { data, error } = await supabase
            .from('positions')
            .select('*, companies(*)')
            .eq('id', params.id)
            .eq('user_id', user.id)
            .single();

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error fetching position:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT({ params, request, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { position } = await request.json();

        const { data, error } = await supabase
            .from('positions')
            .update({
                company_id: position.company_id,
                job_title: position.job_title,
                contract_type: position.contract_type,
                start_date: position.start_date,
                end_date: position.end_date,
                base_salary: position.base_salary,
                currency: position.currency,
                description: position.description,
                skills: position.skills
            })
            .eq('id', params.id)
            .eq('user_id', user.id)
            .select('*, companies(*)')
            .single();

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error updating position:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE({ params, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { error } = await supabase
            .from('positions')
            .delete()
            .eq('id', params.id)
            .eq('user_id', user.id);

        if (error) throw error;

        return json({ success: true });
    } catch (error) {
        console.error('Error deleting position:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
