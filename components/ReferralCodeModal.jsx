"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

function getCookie(name) {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
}

export default function ReferralCodeModal() {
    const [visible, setVisible] = useState(false);
    const [code, setCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null); // { success, message }
    const [dismissed, setDismissed] = useState(false);

    const searchParams = useSearchParams();

    // Check if we should show the modal
    useEffect(() => {
        async function checkReferralStatus() {
            try {
                // Don't show if user already dismissed in this session
                if (sessionStorage.getItem("referral_modal_dismissed")) return;

                // Check if user already has a referrer
                const res = await fetch("/api/referral/submit");
                if (!res.ok) return;
                const data = await res.json();

                if (data.hasReferrer) return; // Already referred, don't show

                // Pre-fill from URL or cookie
                const codeFromUrl = searchParams.get("ref");
                const codeFromCookie = getCookie("ref");
                const prefilled = codeFromUrl || codeFromCookie || "";

                if (prefilled) setCode(prefilled);
                setVisible(true);
            } catch {
                // Silently fail — don't block the dashboard
            }
        }

        // Small delay so it doesn't flash on page load
        const timer = setTimeout(checkReferralStatus, 1500);
        return () => clearTimeout(timer);
    }, [searchParams]);

    const handleSubmit = async () => {
        if (!code.trim()) return;
        setSubmitting(true);
        setResult(null);

        try {
            const res = await fetch("/api/referral/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ referralCode: code.trim() }),
            });

            const data = await res.json();
            setResult({ success: data.success, message: data.message });

            if (data.success) {
                // Auto-close after success
                setTimeout(() => {
                    setVisible(false);
                    sessionStorage.setItem("referral_modal_dismissed", "true");
                }, 2000);
            }
        } catch {
            setResult({ success: false, message: "Network error. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkip = () => {
        setVisible(false);
        setDismissed(true);
        sessionStorage.setItem("referral_modal_dismissed", "true");
    };

    if (!visible || dismissed) return null;

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={handleSkip}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full max-w-md bg-gradient-to-b from-[#0f172a] to-[#020617] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                            {/* Decorative glow */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/15 blur-[80px] rounded-full pointer-events-none" />

                            {/* Close button */}
                            <button
                                onClick={handleSkip}
                                className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/10 z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative z-10 p-8">
                                {/* Icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 flex items-center justify-center shadow-inner">
                                        <Gift className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                                    </div>
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl font-bold text-center text-white mb-2">
                                    Have a Referral Code?
                                </h2>
                                <p className="text-center text-gray-400 text-sm mb-6 leading-relaxed">
                                    If someone invited you to ForeNotes, enter their referral code below to help them earn rewards.
                                </p>

                                {/* Input */}
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="Enter referral code"
                                        maxLength={20}
                                        disabled={submitting || result?.success}
                                        className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl text-white text-center font-mono text-lg tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !submitting) handleSubmit();
                                        }}
                                    />
                                </div>

                                {/* Result message */}
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium ${
                                            result.success
                                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                                : "bg-red-500/10 border border-red-500/20 text-red-400"
                                        }`}
                                    >
                                        {result.success ? (
                                            <CheckCircle className="w-4 h-4 shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                        )}
                                        {result.message}
                                    </motion.div>
                                )}

                                {/* Buttons */}
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!code.trim() || submitting || result?.success}
                                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : result?.success ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Applied!
                                            </>
                                        ) : (
                                            "Apply Referral Code"
                                        )}
                                    </button>

                                    {!result?.success && (
                                        <button
                                            onClick={handleSkip}
                                            className="w-full py-3 text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
                                        >
                                            I don't have a code — Skip
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
