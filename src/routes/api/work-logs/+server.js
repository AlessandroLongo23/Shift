import { json } from '@sveltejs/kit';
import { Guard } from '$lib/server/guards.js';

export async function GET({ url, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const year = url.searchParams.get('year');
        const month = url.searchParams.get('month');

        let query = supabase
            .from('work_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        // Filter by year and month if provided
        if (year && month) {
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
            query = query.gte('date', startDate).lte('date', endDate);
        }

        const { data, error } = await query;

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error fetching work logs:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST({ request, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { workLog } = await request.json();

        const { data, error } = await supabase
            .from('work_logs')
            .insert({
                user_id: user.id,
                position_id: workLog.position_id,
                date: workLog.date,
                check_in: workLog.check_in || null,
                check_out: workLog.check_out || null,
                break_minutes: workLog.break_minutes || 0,
                hours_worked: workLog.hours_worked || 0,
                type: workLog.type || 'work',
                notes: workLog.notes || null,
                mood_rating: workLog.mood_rating || null
            })
            .select()
            .single();

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error creating work log:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
