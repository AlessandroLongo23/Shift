import { json } from '@sveltejs/kit';

export async function POST({ request, locals: { supabase } }) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return json({ success: false, error: 'Email and password are required' }, { status: 400 });
        }

        const { data: { user }, error } = await supabase.auth.signInWithPassword({ 
            email, 
            password 
        });

        if (error) {
            let errorMessage = error.message;
            if (errorMessage.includes('Invalid login')) {
                errorMessage = 'Invalid email or password. Please try again.';
            }
            return json({ success: false, error: errorMessage }, { status: 401 });
        }

        return json({ success: true, user });
    } catch (error) {
        console.error('Error logging in:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
