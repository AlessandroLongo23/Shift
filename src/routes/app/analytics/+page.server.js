export const load = async ({ locals: { user, supabase } }) => {
    const paychecks = supabase
        .from('paychecks')
        .select('*, positions(*, companies(*))')
        .eq('user_id', user.id)
        .order('reference_date', { ascending: false })
        .then(r => r.data ?? []);

    const workLogs = supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .then(r => r.data ?? []);

    return { paychecks, workLogs };
};
