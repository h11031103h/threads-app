import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const token = authHeader.replace("Bearer ", "");

        // We need the user ID. Usually passed as query param or stored.
        // Let's assume passed as query param for flexibility
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

        // Fetch User Insights
        // Metrics: views, likes, replies, reposts, quotes, followers_count
        // Note: followers_count is on the User object itself, not insights edge usually.
        // Insights edge is for media or user time-series.
        // Let's get User fields first for followers.

        const userUrl = `https://graph.threads.net/v1.0/${userId}?fields=id,username,threads_biography,followers_count&access_token=${token}`;
        const userRes = await fetch(userUrl);
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData.error?.message);

        // Fetch Insights (Time Series) - This might be "insights" edge
        // Threads API insights are limited. Let's return what we have.
        // Currently, `followers_count` is the main reliable metric we can get easily.

        return NextResponse.json({
            followers_count: userData.followers_count,
            username: userData.username,
            // Mocking timeseries for now because API history requires complex queries or might not exist purely as 'daily history' endpoints
            // but we return the REAL current count.
        });

    } catch (error: any) {
        console.error("Insights Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
