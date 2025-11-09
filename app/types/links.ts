export interface LinkStatEntry {
    date: string;
    clicks: number;
}

export interface Link {
    id?: number;
    name: string;
    short: string;
    full: string;
    project?: string;
    created_at?: Date;
    clicks?: number;
    stats?: LinkStatEntry[];
    userId?: string;
    userLogin?: string | null;
}

export interface SaveLink {
    name: string;
    full: string;
    short?: string;
    userId?: string;
}