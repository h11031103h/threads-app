import { NextResponse } from "next/server";

export async function GET() {
    const appId = process.env.THREADS_APP_ID;
    const redirectUri = process.env.THREADS_REDIRECT_URI;
    const scopes = [
        "threads_basic",
        "threads_content_publish",
        "threads_manage_replies",
        "threads_read_replies",
        "threads_manage_insights",
    ].join(",");

    if (!appId || !redirectUri) {
        return NextResponse.json(
            { error: "Missing environment variables" },
            { status: 500 }
        );
    }

    const url = `https://threads.net/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(
        redirectUri
    )}&scope=${scopes}&response_type=code`;

    return NextResponse.redirect(url);
}
