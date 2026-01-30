import { json } from '@sveltejs/kit';

export async function POST({ locals: { supabase } }) {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            return json({ success: false, error: error.message }, { status: 500 });
        }

        return json({ success: true });
    } catch (error) {
        console.error('Error logging out:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
