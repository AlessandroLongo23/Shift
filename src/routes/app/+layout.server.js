import { redirect } from '@sveltejs/kit';

export const load = async ({ locals: { session, user } }) => {
    if (!user) {
        throw redirect(303, '/');
    }

    return {
        session,
        user
    };
};
