"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithThreads } from "../../actions";

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState("Authenticating...");

    useEffect(() => {
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
            setStatus(`Error: ${error}`);
            return;
        }

        if (code) {
            // Call Server Action
            loginWithThreads(code)
                .then((result) => {
                    if (result.success) {
                        setStatus("Success! Redirecting...");
                        window.location.href = "/dashboard"; // Hard navigation to refresh session cookies
                    } else {
                        setStatus("Authentication Failed: " + (result.error || "Unknown error"));
                    }
                })
                .catch(err => {
                    console.error(err);
                    setStatus("Authentication Error");
                });
        } else {
            setStatus("No code found.");
        }
    }, [searchParams, router]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            color: 'white',
            fontSize: '1.5rem'
        }}>
            {status}
        </div>
    );
}

export default function Callback() {
    return (
        <Suspense fallback={<div style={{ color: 'white', padding: '20px' }}>Loading...</div>}>
            <CallbackContent />
        </Suspense>
    );
}
