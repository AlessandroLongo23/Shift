export const load = async ({ locals: { user, supabase } }) => {
    const [{ data: workLogs }, { data: paychecks }] = await Promise.all([
        supabase
            .from('work_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false }),
        supabase
            .from('paychecks')
            .select('*, positions(*, companies(*))')
            .eq('user_id', user.id)
            .order('reference_date', { ascending: false })
    ]);

    return {
        workLogs: workLogs ?? [],
        paychecks: paychecks ?? []
    };
};
