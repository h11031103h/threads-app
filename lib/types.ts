export interface ThreadNode {
    id: string;
    content: string;
    media?: string[];
    replies?: ThreadNode[];
}

export interface ScheduledPost {
    id: string;
    date: string; // ISO String
    root: ThreadNode;
    status: 'scheduled' | 'published' | 'draft' | 'failed';
    publishedIds?: string[];
}
