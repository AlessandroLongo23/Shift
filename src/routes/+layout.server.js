export const load = async ({ locals, depends }) => {
	depends('supabase:auth');

	return {
		session: locals.session ?? null,
		user: locals.user ?? null
	};
};
