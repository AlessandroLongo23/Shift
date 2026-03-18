export const load = async ({ locals: { user, supabase } }) => {
    const { data: paychecks } = await supabase
        .from('paychecks')
        .select('*, positions(*, companies(*))')
        .eq('user_id', user.id)
        .order('reference_date', { ascending: false });

    return {
        paychecks: paychecks ?? []
    };
};
