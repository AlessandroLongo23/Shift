export class Paycheck {
    id: string;
    user_id: string;
    position_id: string;
    reference_date: string;
    net_amount: number;
    gross_amount: number | null;
    bonuses: number;
    pdf_storage_path: string | null;
    is_synced_to_budget: boolean;
    created_at: string;

    // Populated from join
    position?: any;

    constructor(paycheck: any) {
        this.id = paycheck.id;
        this.user_id = paycheck.user_id;
        this.position_id = paycheck.position_id;
        this.reference_date = paycheck.reference_date;
        this.net_amount = paycheck.net_amount;
        this.gross_amount = paycheck.gross_amount;
        this.bonuses = paycheck.bonuses || 0;
        this.pdf_storage_path = paycheck.pdf_storage_path;
        this.is_synced_to_budget = paycheck.is_synced_to_budget || false;
        this.created_at = paycheck.created_at;
        this.position = paycheck.positions || paycheck.position;
    }

    public getMonthYear(): string {
        const date = new Date(this.reference_date);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    public getTotalAmount(): number {
        return this.net_amount + this.bonuses;
    }

}
