import { NextResponse } from "next/server";

async function createContainer(userId: string, token: string, content: string, replyToId?: string) {
    const url = `https://graph.threads.net/v1.0/${userId}/threads`;
    const params = new URLSearchParams({
        media_type: "TEXT",
        text: content,
        access_token: token,
    });
    if (replyToId) {
        params.append("reply_to_id", replyToId);
    }

    const res = await fetch(url, { method: "POST", body: params });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Failed to create container");
    return data.id;
}

async function publishContainer(userId: string, token: string, containerId: string) {
    const url = `https://graph.threads.net/v1.0/${userId}/threads_publish`;
    const params = new URLSearchParams({
        creation_id: containerId,
        access_token: token,
    });

    const res = await fetch(url, { method: "POST", body: params });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Failed to publish container");
    return data.id;
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const token = authHeader.replace("Bearer ", "");

        const body = await request.json();
        const { userId, nodes } = body; // nodes: { content: string }[] representing the thread

        if (!userId || !nodes || !Array.isArray(nodes) || nodes.length === 0) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        let previousPublishedId: string | undefined = undefined;
        const publishedIds = [];

        // Process sequentially to form a thread
        for (const node of nodes) {
            // 1. Create Container
            const containerId = await createContainer(userId, token, node.content, previousPublishedId);

            // 2. Publish Container
            // Note: Threads API might require status check before publish if media is involved.
            // For TEXT, it's usually instant.
            const publishedId = await publishContainer(userId, token, containerId);

            publishedIds.push(publishedId);
            previousPublishedId = publishedId;
        }

        return NextResponse.json({ success: true, publishedIds });
    } catch (error: any) {
        console.error("Publish Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
