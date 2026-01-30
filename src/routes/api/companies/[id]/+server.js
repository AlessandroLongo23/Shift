import { json } from '@sveltejs/kit';
import { Guard } from '$lib/server/guards.js';

export async function GET({ params, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', params.id)
            .eq('user_id', user.id)
            .single();

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error fetching company:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT({ params, request, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { company } = await request.json();

        const { data, error } = await supabase
            .from('companies')
            .update({
                name: company.name,
                logo_url: company.logo_url,
                website: company.website,
                color_theme: company.color_theme
            })
            .eq('id', params.id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;

        return json({ success: true, data });
    } catch (error) {
        console.error('Error updating company:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE({ params, locals: { supabase } }) {
    try {
        const { user, response } = await Guard.user(supabase);
        if (response) return response;

        const { error } = await supabase
            .from('companies')
            .delete()
            .eq('id', params.id)
            .eq('user_id', user.id);

        if (error) throw error;

        return json({ success: true });
    } catch (error) {
        console.error('Error deleting company:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
