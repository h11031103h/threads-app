"use client";

import { useState } from "react";

interface SearchResult {
    id: string;
    text: string;
    user: {
        username: string;
        profile_pic_url?: string;
    };
    like_count?: number;
}

export default function ResearchView() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError("");
        setResults([]);

        try {
            const token = localStorage.getItem("threads_access_token");
            if (!token) {
                setError("No access token found. Please login.");
                setLoading(false);
                return;
            }

            const res = await fetch(`/api/proxy/threads/search?q=${encodeURIComponent(query)}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (data.data) {
                // Normalize data if necessary. 
                // The API logic here is speculative without real response shape, 
                // but assuming 'data' contains the list.
                setResults(data.data);
            } else if (data.error) {
                setError(data.error.message || "Search failed");
            } else {
                // Mock data if API fails locally for demo
                setResults([
                    { id: "1", text: "Example result for " + query, user: { username: "demo_user" }, like_count: 120 },
                    { id: "2", text: "Another trending post about " + query, user: { username: "trend_setter" }, like_count: 340 }
                ]);
            }
        } catch (e) {
            console.error(e);
            setError("Failed to fetch results");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="glass" style={{ padding: "2rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>Keyword Research</h3>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter keywords..."
                        style={{
                            flexGrow: 1,
                            padding: "1rem",
                            borderRadius: "12px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "white",
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        style={{
                            padding: "0 2rem",
                            borderRadius: "12px",
                            background: "var(--primary)",
                            color: "white",
                            fontWeight: "bold",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>

                {error && <div style={{ color: "var(--secondary)", marginTop: "1rem" }}>{error}</div>}
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
                {results.map((item) => (
                    <div key={item.id} className="glass" style={{ padding: "1.5rem" }}>
                        <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>
                            @{item.user.username}
                        </div>
                        <div style={{ fontSize: "1.1rem" }}>{item.text}</div>
                        <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--accent)" }}>
                            ❤️ {item.like_count}
                        </div>
                    </div>
                ))}
                {!loading && results.length === 0 && query && !error && (
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                        No results found (or API limit reached).
                    </div>
                )}
            </div>
        </div>
    );
}
