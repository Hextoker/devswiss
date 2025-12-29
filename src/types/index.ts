export interface Tool {
    id: string;
    name: string;
    description: string;
    category: string; // e.g., 'converters', 'formatters', 'generators'
    path: string;
    icon?: string;
    keywords?: string[];
}
