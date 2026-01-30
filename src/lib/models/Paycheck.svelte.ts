import { Banknote, Calendar, FileUp, Link } from 'lucide-svelte';
import { formatCurrency, formatDate } from '$lib/utils/format.js';

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

    public static dataColumns: any[] = [
        {
            label: 'Month',
            key: 'reference_date',
            sortable: true,
            icon: Calendar,
            display: (paycheck: Paycheck) => paycheck.getMonthYear()
        },
        {
            label: 'Net',
            key: 'net_amount',
            sortable: true,
            icon: Banknote,
            display: (paycheck: Paycheck) => formatCurrency(paycheck.net_amount)
        },
        {
            label: 'Gross',
            key: 'gross_amount',
            sortable: true,
            icon: Banknote,
            display: (paycheck: Paycheck) => paycheck.gross_amount ? formatCurrency(paycheck.gross_amount) : 'N/A'
        },
        {
            label: 'Bonuses',
            key: 'bonuses',
            sortable: true,
            icon: Banknote,
            display: (paycheck: Paycheck) => paycheck.bonuses > 0 ? formatCurrency(paycheck.bonuses) : '—'
        },
        {
            label: 'PDF',
            key: 'pdf_storage_path',
            sortable: false,
            icon: FileUp,
            display: (paycheck: Paycheck) => paycheck.pdf_storage_path ? '📄' : '—'
        },
        {
            label: 'Synced',
            key: 'is_synced_to_budget',
            sortable: true,
            icon: Link,
            display: (paycheck: Paycheck) => {
                return paycheck.is_synced_to_budget 
                    ? '<span class="text-emerald-500">✓</span>' 
                    : '<span class="text-zinc-400">—</span>';
            }
        }
    ];
}
