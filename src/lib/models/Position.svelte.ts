import { Briefcase, Calendar, Banknote, FileText, Tag } from 'lucide-svelte';
import { formatCurrency, formatDate } from '$lib/utils/format.js';
import { Currency } from '$lib/const/currency';
import { ContractType, ContractTypeMap } from '$lib/const/contract';


export class Position {
    id: string;
    user_id: string;
    company_id: string;
    job_title: string;
    contract_type: ContractType;
    start_date: string;
    end_date: string | null;
    base_salary: number | null;
    currency: string;
    description: string | null;
    skills: string[];
    created_at: string;

    // Populated from join
    company?: any;

    constructor(position: any) {
        this.id = position.id;
        this.user_id = position.user_id;
        this.company_id = position.company_id;
        this.job_title = position.job_title;
        this.contract_type = position.contract_type;
        this.start_date = position.start_date;
        this.end_date = position.end_date;
        this.base_salary = position.base_salary;
        this.currency = position.currency || Currency.EURO;
        this.description = position.description;
        this.skills = position.skills || [];
        this.created_at = position.created_at;
        this.company = position.companies || position.company;
    }

    public isCurrent(): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startDate = new Date(this.start_date);
        startDate.setHours(0, 0, 0, 0);
        
        // If today is before start date, not current
        if (today < startDate) return false;
        
        // If no end date, position is current (ongoing)
        if (this.end_date === null || this.end_date === undefined || this.end_date === '') {
            return true;
        }
        
        // Check if today is before or on the end date
        const endDate = new Date(this.end_date);
        endDate.setHours(23, 59, 59, 999);
        return today <= endDate;
    }

    public getDurationMonths(): number {
        const start = new Date(this.start_date);
        const end = this.end_date ? new Date(this.end_date) : new Date();
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        return Math.max(1, months);
    }

    public getDurationString(): string {
        const months = this.getDurationMonths();
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        
        if (years === 0) {
            return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
        } else if (remainingMonths === 0) {
            return `${years} year${years !== 1 ? 's' : ''}`;
        }
        return `${years}y ${remainingMonths}m`;
    }

    public getPeriodString(): string {
        const startFormatted = formatDate(this.start_date, 'short');
        const endFormatted = this.end_date ? formatDate(this.end_date, 'short') : 'Present';
        return `${startFormatted} - ${endFormatted}`;
    }

    public static dataColumns: any[] = [
        {
            label: 'Title',
            key: 'job_title',
            sortable: true,
            icon: Briefcase,
            display: (position: Position) => position.job_title
        },
        {
            label: 'Contract',
            key: 'contract_type',
            sortable: true,
            icon: FileText,
            display: (position: Position) => {
                const colors: Record<ContractType, string> = {
                    [ContractType.FULL_TIME]: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
                    [ContractType.PART_TIME]: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
                    [ContractType.FREELANCE]: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
                    [ContractType.STUDENT]: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                };
                return `<span class="rounded-full px-2 py-1 text-xs ${colors[position.contract_type]}">${ContractTypeMap[position.contract_type as ContractType]}</span>`;
            }
        },
        {
            label: 'Period',
            key: 'start_date',
            sortable: true,
            icon: Calendar,
            display: (position: Position) => position.getPeriodString()
        },
        {
            label: 'Salary',
            key: 'base_salary',
            sortable: true,
            icon: Banknote,
            display: (position: Position) => position.base_salary ? formatCurrency(position.base_salary, position.currency) : 'N/A'
        },
        {
            label: 'Skills',
            key: 'skills',
            sortable: false,
            icon: Tag,
            display: (position: Position) => {
                if (!position.skills || position.skills.length === 0) return 'N/A';
                return position.skills.slice(0, 3).map(s => 
                    `<span class="inline-block bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded px-2 py-0.5 text-xs mr-1">${s}</span>`
                ).join('') + (position.skills.length > 3 ? `<span class="text-zinc-500 text-xs">+${position.skills.length - 3}</span>` : '');
            }
        }
    ];
}
