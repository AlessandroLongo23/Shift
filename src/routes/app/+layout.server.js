import { redirect } from '@sveltejs/kit';

export const load = async ({ locals: { session, user, supabase } }) => {
    if (!user) {
        throw redirect(303, '/');
    }

    const [{ data: companies }, { data: positions }] = await Promise.all([
        supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .order('name'),
        supabase
            .from('positions')
            .select('*, companies(*)')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false })
    ]);

    return {
        session,
        user,
        companies: companies ?? [],
        positions: positions ?? []
    };
};
