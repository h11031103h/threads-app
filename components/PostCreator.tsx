"use client";

import { useState } from "react";
import { ThreadNode, ScheduledPost } from "../lib/types";
import { saveDbPost } from "../app/actions";

interface PostCreatorProps {
    selectedDate: Date;
    onClose: () => void;
    onSave: () => void;
}

export default function PostCreator({ selectedDate, onClose, onSave }: PostCreatorProps) {
    const [nodes, setNodes] = useState<ThreadNode[]>([
        { id: "root", content: "", replies: [] },
    ]);

    const updateNodeContent = (index: number, content: string) => {
        const newNodes = [...nodes];
        newNodes[index].content = content;
        setNodes(newNodes);
    };

    const addReply = () => {
        setNodes([...nodes, { id: crypto.randomUUID(), content: "", replies: [] }]);
    };

    const handleSave = async () => {
        // Linear thread construction for V1
        let current: ThreadNode = { ...nodes[0], replies: [] };
        let pointer = current;

        for (let i = 1; i < nodes.length; i++) {
            const nextNode: ThreadNode = { ...nodes[i], replies: [] };
            if (!pointer.replies) pointer.replies = [];
            pointer.replies.push(nextNode);
            // pointer = nextNode; // Assuming linear structure
        }

        const post: ScheduledPost = {
            id: crypto.randomUUID(),
            date: selectedDate.toISOString(),
            root: current,
            status: "scheduled",
        };

        await saveDbPost(post);
        onSave();
    };

    const handlePublishNow = async () => {
        const token = localStorage.getItem("threads_access_token");
        const userId = localStorage.getItem("threads_user_id");

        if (!token || !userId) {
            alert("Please login first.");
            return;
        }

        if (!confirm("Are you sure you want to publish this thread now?")) return;

        const nodesData = nodes.map(n => ({ content: n.content })); // simplified structure for API

        try {
            const res = await fetch("/api/proxy/threads/publish", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ userId, nodes: nodesData })
            });

            const data = await res.json();
            if (data.success) {
                alert("Published successfully!");
                // Also save to DB as published
                const post: ScheduledPost = {
                    id: crypto.randomUUID(),
                    date: new Date().toISOString(),
                    root: { ...nodes[0], replies: [] }, // Approximate
                    status: "published",
                    publishedIds: data.publishedIds
                };
                await saveDbPost(post);
                onSave();
            } else {
                alert("Failed to publish: " + (data.error || "Unknown error"));
            }
        } catch (e: any) {
            alert("Error: " + e.message);
        }
    };

    return (
        <div className="glass" style={{ padding: "2rem", marginTop: "1rem" }}>
            <h3 style={{ marginBottom: "1rem", color: "white" }}>
                New Post for {selectedDate.toLocaleDateString()}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {nodes.map((node, index) => (
                    <div key={node.id} style={{ display: "flex", gap: "10px" }}>
                        <div style={{
                            display: "flex", flexDirection: "column", alignItems: "center", minWidth: "20px"
                        }}>
                            <div style={{
                                width: "40px", height: "40px", borderRadius: "50%", background: "#333",
                                display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold"
                            }}>
                                {index === 0 ? "Main" : index}
                            </div>
                            {index < nodes.length - 1 && (
                                <div style={{ width: "2px", flexGrow: 1, background: "#333", margin: "5px 0" }} />
                            )}
                        </div>

                        <textarea
                            value={node.content}
                            onChange={(e) => updateNodeContent(index, e.target.value)}
                            placeholder={index === 0 ? "Start a thread..." : "Reply to thread..."}
                            style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: "12px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "white",
                                minHeight: "100px",
                                resize: "vertical",
                                fontFamily: "inherit"
                            }}
                        />
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                <button
                    onClick={addReply}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.3)",
                        color: "white",
                        cursor: "pointer"
                    }}
                >
                    + Add to thread
                </button>

                <div style={{ flexGrow: 1 }} />

                <button
                    onClick={onClose}
                    style={{
                        padding: "8px 24px",
                        borderRadius: "20px",
                        background: "transparent",
                        border: "none",
                        color: "rgba(255,255,255,0.6)",
                        cursor: "pointer"
                    }}
                >
                    Cancel
                </button>

                <button
                    onClick={handlePublishNow}
                    style={{
                        padding: "8px 24px",
                        borderRadius: "20px",
                        background: "var(--accent)",
                        border: "none",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    Publish Now
                </button>

                <button
                    onClick={handleSave}
                    style={{
                        padding: "8px 24px",
                        borderRadius: "20px",
                        background: "var(--primary)",
                        border: "none",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    Schedule Post
                </button>
            </div>
        </div>
    );
}
