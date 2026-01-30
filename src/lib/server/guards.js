import { json } from '@sveltejs/kit';

export class Guard {
	static async user(supabase) {
		const { data: { user }, error } = await supabase.auth.getUser();
		if (error || !user) {
			return { user: null, response: json({ success: false, error: 'Not authenticated' }, { status: 401 }) };
		}
		return { user, response: null };
	}
}
