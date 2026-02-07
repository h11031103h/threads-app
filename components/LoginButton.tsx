"use client";

export default function LoginButton() {
    return (
        <a
            href="/api/auth/login"
            style={{
                padding: "12px 24px",
                background: "#000",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                textDecoration: "none",
                display: "inline-block",
                marginTop: "2rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
            }}
        >
            Login with Threads
        </a>
    );
}
