import { json } from '@sveltejs/kit';
import { Guard } from '$lib/server/guards.js';

export async function GET({ locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { data, error } = await supabase
            .from('paychecks')
            .select('*, positions(*, companies(*))')
            .eq('user_id', user.id)
            .order('reference_date', { ascending: false });

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error fetching paychecks:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST({ request, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { paycheck } = await request.json();

        const { data, error } = await supabase
            .from('paychecks')
            .insert({
                user_id: user.id,
                position_id: paycheck.position_id,
                reference_date: paycheck.reference_date,
                net_amount: paycheck.net_amount,
                gross_amount: paycheck.gross_amount || null,
                bonuses: paycheck.bonuses || 0,
                pdf_storage_path: paycheck.pdf_storage_path || null,
                is_synced_to_budget: paycheck.is_synced_to_budget || false
            })
            .select('*, positions(*, companies(*))')
            .single();

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error creating paycheck:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
