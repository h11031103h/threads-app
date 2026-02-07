import { ScheduledPost, ThreadNode } from "./types";

const STORAGE_KEY = "threads_scheduled_posts";

export const getScheduledPosts = (): ScheduledPost[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse posts", e);
        return [];
    }
};

export const saveScheduledPost = (post: ScheduledPost) => {
    const posts = getScheduledPosts();
    const existingIndex = posts.findIndex((p) => p.id === post.id);

    if (existingIndex >= 0) {
        posts[existingIndex] = post;
    } else {
        posts.push(post);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const deleteScheduledPost = (id: string) => {
    const posts = getScheduledPosts();
    const filtered = posts.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
