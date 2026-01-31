import { json } from '@sveltejs/kit';
import { Guard } from '$lib/server/guards.js';

export async function GET({ params, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { data, error } = await supabase
            .from('work_logs')
            .select('*')
            .eq('id', params.id)
            .eq('user_id', user.id)
            .single();

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error fetching work log:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT({ params, request, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { workLog } = await request.json();

        const { data, error } = await supabase
            .from('work_logs')
            .update({
                position_id: workLog.position_id,
                date: workLog.date,
                check_in: workLog.check_in,
                check_out: workLog.check_out,
                break_minutes: workLog.break_minutes,
                hours_worked: workLog.hours_worked,
                type: workLog.type,
                notes: workLog.notes,
                mood_rating: workLog.mood_rating
            })
            .eq('id', params.id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error updating work log:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE({ params, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { error } = await supabase
            .from('work_logs')
            .delete()
            .eq('id', params.id)
            .eq('user_id', user.id);

        if (error) throw error;

        return json({ success: true });
    } catch (error) {
        console.error('Error deleting work log:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
