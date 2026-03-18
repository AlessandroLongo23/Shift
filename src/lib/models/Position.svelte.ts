import { formatDate } from '$lib/utils/format.js';
import { Currency } from '$lib/const/currency';
import { ContractType } from '$lib/const/contract';


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

}
