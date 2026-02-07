"use server";

import { prisma } from "@/lib/prisma";
import { ScheduledPost, ThreadNode } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginWithThreads(code: string) {
    const client_id = process.env.THREADS_APP_ID;
    const client_secret = process.env.THREADS_APP_SECRET;
    const redirect_uri = process.env.THREADS_REDIRECT_URI; // e.g. http://localhost:3000/auth/callback

    if (!client_id || !client_secret || !redirect_uri) {
        throw new Error("Missing server configuration");
    }

    // Exchange code for token
    const params = new URLSearchParams({
        client_id,
        client_secret,
        grant_type: "authorization_code",
        redirect_uri,
        code,
    });

    const res = await fetch("https://graph.threads.net/oauth/access_token", {
        method: "POST",
        body: params,
    });

    const data = await res.json();
    if (!res.ok || !data.access_token) {
        console.error("Token Exchange Error:", data);
        return { error: data.error_message || "Failed to exchange token" };
    }

    const { access_token, user_id } = data;

    // Save to DB
    // 1. Find or create user
    // We assume 1 user = 1 threads account for this V1, or we just map by providerAccountId

    // Check if account exists
    let account = await prisma.account.findUnique({
        where: {
            provider_providerAccountId: {
                provider: "threads",
                providerAccountId: user_id.toString(),
            }
        },
        include: { user: true }
    });

    if (!account) {
        // Create new User and Account
        const newUser = await prisma.user.create({ data: {} });
        account = await prisma.account.create({
            data: {
                userId: newUser.id,
                provider: "threads",
                providerAccountId: user_id.toString(),
                accessToken: access_token,
            },
            include: { user: true }
        });
    } else {
        // Update token
        await prisma.account.update({
            where: { id: account.id },
            data: { accessToken: access_token }
        });
    }

    // Set Session
    const session = await getSession();
    session.userId = account.userId;
    session.isLoggedIn = true;
    await session.save();

    return { success: true };
}


// Helper to ensure we have a default user/account for now
// In a real auth flow, we would get this from the session
async function getOrCreateDefaultAccount() {
    // Try to find an account or create a dummy one for single-user mode
    let account = await prisma.account.findFirst();
    if (!account) {
        const user = await prisma.user.create({ data: {} });
        account = await prisma.account.create({
            data: {
                userId: user.id,
                provider: "threads",
                providerAccountId: "default_user", // This should be updated on real login
                accessToken: "placeholder",
            }
        });
    }
    return account;
}

export async function getDbPosts(): Promise<ScheduledPost[]> {
    const account = await prisma.account.findFirst();
    if (!account) return [];

    const dbPosts = await prisma.scheduledPost.findMany({
        where: { accountId: account.id },
        orderBy: { scheduledFor: 'asc' }
    });

    return dbPosts.map((p: any) => ({
        id: p.id,
        date: p.scheduledFor.toISOString(),
        status: p.status as "scheduled" | "published" | "draft",
        root: JSON.parse(p.content) as ThreadNode,
        publishedIds: p.publishedIds ? JSON.parse(p.publishedIds) : undefined
    }));
}

export async function saveDbPost(post: ScheduledPost) {
    const account = await getOrCreateDefaultAccount();

    await prisma.scheduledPost.create({
        data: {
            id: post.id, // Use the ID from client if provided, or let DB handle it? 
            // Client generates ID currently. Let's force strict checking or upsert.
            accountId: account.id,
            scheduledFor: new Date(post.date),
            status: post.status,
            content: JSON.stringify(post.root),
            publishedIds: post.publishedIds ? JSON.stringify(post.publishedIds) : null
        }
    });

    revalidatePath("/dashboard");
}

export async function updateDbPostStatus(id: string, status: string, publishedIds?: string[]) {
    await prisma.scheduledPost.update({
        where: { id },
        data: {
            status,
            publishedIds: publishedIds ? JSON.stringify(publishedIds) : undefined
        }
    });
    revalidatePath("/dashboard");
}
