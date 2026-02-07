import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
        return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    if (!q) {
        return NextResponse.json(
            { error: "Missing search query" },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(`https://graph.threads.net/v1.0/keywords_search?q=${encodeURIComponent(q)}&access_token=${token}`, {
            method: 'GET'
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Search Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
