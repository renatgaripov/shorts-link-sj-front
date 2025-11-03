export interface Link {
        id?: number;
        name: string;
        short: string;
        full: string;
        project?: string;
        created_at?: Date;
        clicks?: number;
    }

    export interface SaveLink { 
        name: string;
        full: string;
        short?: string;
    }