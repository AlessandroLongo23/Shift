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

}
