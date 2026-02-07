"use client";

import { useState, useEffect } from "react";
import CalendarView from "../../components/CalendarView";
import PostCreator from "../../components/PostCreator";
import AnalyticsView from "../../components/AnalyticsView";
import ResearchView from "../../components/ResearchView";
import { getDbPosts } from "../actions";
import { ScheduledPost } from "../../lib/types";

export default function Dashboard() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isCreating, setIsCreating] = useState(false);
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [activeTab, setActiveTab] = useState<"calendar" | "analytics" | "research">("calendar");

    useEffect(() => {
        // Load posts from DB
        getDbPosts().then(setPosts);
        // Note: In a real app we might want to subscribe to updates or re-fetch on focus
    }, [isCreating]);

    const postsForDate = posts.filter((p) => {
        const d = new Date(p.date);
        return (
            d.getDate() === selectedDate.getDate() &&
            d.getMonth() === selectedDate.getMonth() &&
            d.getFullYear() === selectedDate.getFullYear()
        );
    });

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                padding: "10px 20px",
                borderRadius: "20px",
                background: activeTab === id ? "rgba(255,255,255,0.2)" : "transparent",
                border: "none",
                color: activeTab === id ? "white" : "rgba(255,255,255,0.6)",
                fontWeight: activeTab === id ? "bold" : "normal",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s"
            }}
        >
            <span>{icon}</span> {label}
        </button>
    );

    return (
        <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
            <header style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Dashboard</h1>
                    <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)" }}>
                        Threads Manager
                    </div>
                </div>

                <div className="glass" style={{ display: "inline-flex", padding: "5px", borderRadius: "25px", gap: "5px" }}>
                    <TabButton id="calendar" label="Schedule" icon="📅" />
                    <TabButton id="analytics" label="Analytics" icon="📈" />
                    <TabButton id="research" label="Research" icon="🔍" />
                </div>
            </header>

            {activeTab === "calendar" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                    {/* Left Col: Calendar */}
                    <div>
                        <h2 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            Calendar
                        </h2>
                        <CalendarView onDateSelect={setSelectedDate} />

                        <div style={{ marginTop: "2rem" }}>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="glass"
                                style={{
                                    width: "100%", padding: "1rem", color: "white", fontWeight: "bold", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                                }}
                            >
                                <span>+</span> Create Post for {selectedDate.toLocaleDateString()}
                            </button>
                        </div>
                    </div>

                    {/* Right Col: Content */}
                    <div>
                        <h2 style={{ marginBottom: "1rem" }}>
                            {selectedDate.toLocaleDateString()}
                        </h2>

                        {isCreating ? (
                            <PostCreator
                                selectedDate={selectedDate}
                                onClose={() => setIsCreating(false)}
                                onSave={() => setIsCreating(false)} // This toggles back to view, fetching is handled by useEffect dependency
                            />
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {postsForDate.length === 0 ? (
                                    <div className="glass" style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
                                        No posts scheduled for this day.
                                    </div>
                                ) : (
                                    postsForDate.map(post => (
                                        <div key={post.id} className="glass" style={{ padding: "1.5rem" }}>
                                            <div style={{ marginBottom: "0.5rem", fontSize: "0.8rem", color: "var(--accent)" }}>
                                                {post.status.toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                                                {post.root.content}
                                            </div>
                                            {post.root.replies && post.root.replies.length > 0 && (
                                                <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)" }}>
                                                    + {post.root.replies.length} replies in thread
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "analytics" && <AnalyticsView />}

            {activeTab === "research" && <ResearchView />}

        </div>
    );
}
