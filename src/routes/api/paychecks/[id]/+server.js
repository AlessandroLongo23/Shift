import { json } from '@sveltejs/kit';
import { Guard } from '$lib/server/guards.js';

export async function GET({ params, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { data, error } = await supabase
            .from('paychecks')
            .select('*, positions(*, companies(*))')
            .eq('id', params.id)
            .eq('user_id', user.id)
            .single();

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error fetching paycheck:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT({ params, request, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { paycheck } = await request.json();

        const { data, error } = await supabase
            .from('paychecks')
            .update({
                position_id: paycheck.position_id,
                reference_date: paycheck.reference_date,
                net_amount: paycheck.net_amount,
                gross_amount: paycheck.gross_amount,
                bonuses: paycheck.bonuses,
                pdf_storage_path: paycheck.pdf_storage_path,
                is_synced_to_budget: paycheck.is_synced_to_budget
            })
            .eq('id', params.id)
            .eq('user_id', user.id)
            .select('*, positions(*, companies(*))')
            .single();

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error updating paycheck:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE({ params, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { error } = await supabase
            .from('paychecks')
            .delete()
            .eq('id', params.id)
            .eq('user_id', user.id);

        if (error) throw error;

        return json({ success: true });
    } catch (error) {
        console.error('Error deleting paycheck:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
