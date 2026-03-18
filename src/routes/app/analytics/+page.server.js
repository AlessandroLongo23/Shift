export const load = async ({ locals: { user, supabase } }) => {
    const [{ data: paychecks }, { data: workLogs }] = await Promise.all([
        supabase
            .from('paychecks')
            .select('*, positions(*, companies(*))')
            .eq('user_id', user.id)
            .order('reference_date', { ascending: false }),
        supabase
            .from('work_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
    ]);

    return {
        paychecks: paychecks ?? [],
        workLogs: workLogs ?? []
    };
};
