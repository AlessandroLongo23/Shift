import { json } from '@sveltejs/kit';
import { Guard } from '$lib/server/guards.js';

export async function GET({ locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .order('name');

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error fetching companies:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST({ request, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { company } = await request.json();

        const { data, error } = await supabase
            .from('companies')
            .insert({
                user_id: user.id,
                name: company.name,
                logo_url: company.logo_url || null,
                website: company.website || null,
                color_theme: company.color_theme || null
            })
            .select()
            .single();

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error creating company:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
