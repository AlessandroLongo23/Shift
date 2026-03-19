export const load = async ({ locals: { user, supabase } }) => {
    const workLogs = supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .then(r => r.data ?? []);

    const paychecks = supabase
        .from('paychecks')
        .select('*, positions(*, companies(*))')
        .eq('user_id', user.id)
        .order('reference_date', { ascending: false })
        .then(r => r.data ?? []);

    return { workLogs, paychecks };
};
