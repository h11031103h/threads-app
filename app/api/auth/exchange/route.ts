import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { code } = await request.json();
    const appId = process.env.THREADS_APP_ID;
    const appSecret = process.env.THREADS_APP_SECRET;
    const redirectUri = process.env.THREADS_REDIRECT_URI;

    if (!code || !appId || !appSecret || !redirectUri) {
        return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 }
        );
    }

    try {
        const formData = new URLSearchParams();
        formData.append("client_id", appId);
        formData.append("client_secret", appSecret);
        formData.append("grant_type", "authorization_code");
        formData.append("redirect_uri", redirectUri);
        formData.append("code", code);

        const response = await fetch("https://graph.threads.net/oauth/access_token", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Token Exchange Error:", data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Token Exchange Exception:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
