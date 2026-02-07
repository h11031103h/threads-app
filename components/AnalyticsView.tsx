"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import { useState, useEffect } from "react";

const initialFollowerData = [
    { name: "Mon", followers: 4000 },
    { name: "Tue", followers: 4050 },
    { name: "Wed", followers: 4120 },
    { name: "Thu", followers: 4180 },
    { name: "Fri", followers: 4250 },
    { name: "Sat", followers: 4300 },
    { name: "Sun", followers: 4380 },
];

const initialEngagementData = [
    { name: "Mon", likes: 200, replies: 50 },
    { name: "Tue", likes: 300, replies: 80 },
    { name: "Wed", likes: 250, replies: 60 },
    { name: "Thu", likes: 400, replies: 120 },
    { name: "Fri", likes: 350, replies: 90 },
    { name: "Sat", likes: 450, replies: 100 },
    { name: "Sun", likes: 500, replies: 150 },
];

export default function AnalyticsView() {
    const [followerData, setFollowerData] = useState(initialFollowerData);
    const [engagementData, setEngagementData] = useState(initialEngagementData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("threads_access_token");
            const userId = localStorage.getItem("threads_user_id");
            if (!token || !userId) return;

            setLoading(true);
            try {
                const res = await fetch(`/api/proxy/threads/insights?userId=${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.followers_count) {
                    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    const today = days[new Date().getDay()];

                    setFollowerData(prev => {
                        const newData = [...prev];
                        // Just for demo visualization, replace the last data point with real current count
                        newData[newData.length - 1] = {
                            name: today,
                            followers: data.followers_count
                        };
                        return newData;
                    });
                }
            } catch (e) {
                console.error("Failed to fetch analytics", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="glass" style={{ padding: "2rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>Follower Growth {loading && "(Syncing...)"}</h3>
                <div style={{ height: "300px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={followerData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ background: "#000", border: "1px solid #333", borderRadius: "8px" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="followers"
                                stroke="var(--primary)"
                                strokeWidth={3}
                                dot={{ fill: "var(--primary)" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass" style={{ padding: "2rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>Engagement (Likes & Replies)</h3>
                <div style={{ height: "300px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={engagementData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip
                                contentStyle={{ background: "#000", border: "1px solid #333", borderRadius: "8px" }}
                            />
                            <Bar dataKey="likes" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="replies" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
