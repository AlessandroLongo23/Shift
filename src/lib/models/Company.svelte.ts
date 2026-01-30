import { Building2, Globe, Palette } from 'lucide-svelte';

export class Company {
    id: string;
    user_id: string;
    name: string;
    logo_url: string | null;
    website: string | null;
    color_theme: string | null;
    created_at: string;

    constructor(company: any) {
        this.id = company.id;
        this.user_id = company.user_id;
        this.name = company.name;
        this.logo_url = company.logo_url;
        this.website = company.website;
        this.color_theme = company.color_theme;
        this.created_at = company.created_at;
    }

    public static dataColumns: any[] = [
        {
            label: 'Name',
            key: 'name',
            sortable: true,
            icon: Building2,
            display: (company: Company) => company.name
        },
        {
            label: 'Website',
            key: 'website',
            sortable: false,
            icon: Globe,
            display: (company: Company) => company.website || 'N/A'
        },
        {
            label: 'Theme',
            key: 'color_theme',
            sortable: false,
            icon: Palette,
            display: (company: Company) => {
                if (!company.color_theme) return 'N/A';
                return `<span class="inline-block w-4 h-4 rounded-full" style="background-color: ${company.color_theme}"></span>`;
            }
        }
    ];
}
