"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { app } from "@/lib/firebase";

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") || "login";
  const [activeTab, setActiveTab] = useState(mode);
  const [checkingLink, setCheckingLink] = useState(false);

  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  useEffect(() => {
    const auth = getAuth(app);
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setCheckingLink(true);
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt("Please provide your email for confirmation");
      }
      
      if (email) {
        // In authpage/page.tsx, replace the signInWithEmailLink success handler:

signInWithEmailLink(auth, email, window.location.href)
  .then(async (result) => {
    window.localStorage.removeItem("emailForSignIn");

    // Sync with backend
    await fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
      }),
    });

    // ── NEW: Check if user has secretKey ──
    const meRes = await fetch("/api/auth/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: result.user.uid }),
    });

    if (meRes.ok) {
      const meData = await meRes.json();

      if (!meData.user.isProfileComplete) {
        router.push("/profile");
        return;
      }

      if (meData.user.secretKey) {
        router.push("/notepad");
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  })
  .catch((error) => {
    console.error("Error signing in with email link", error);
    alert("Error signing in. The link might be expired.");
    setCheckingLink(false);
  });
      } else {
        setCheckingLink(false);
      }
    }
  }, [router]);

  if (checkingLink) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center bg-white dark:bg-[#09090b] overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#B21563]/20 rounded-full blur-[120px] -z-0" />
        <p className="relative z-10 text-zinc-500 animate-pulse font-medium">Completing sign in...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-white dark:bg-[#09090b] p-4 overflow-hidden text-black dark:text-zinc-50 font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#B21563]/20 rounded-full blur-[120px] -z-0" />
      
      <div className="relative w-full max-w-md z-10">
        <div className="absolute -inset-1 bg-[#DB4891]/20 rounded-[2rem] blur-2xl -z-10" />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-100/80 dark:bg-zinc-900/80 p-1 rounded-xl h-11 border border-zinc-200 dark:border-zinc-800">
            <TabsTrigger 
              value="login" 
              className="rounded-lg h-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-[#B21563] data-[state=active]:shadow-sm transition-all text-zinc-600 dark:text-zinc-400 font-medium"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="rounded-lg h-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-[#B21563] data-[state=active]:shadow-sm transition-all text-zinc-600 dark:text-zinc-400 font-medium"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-0 focus-visible:outline-none">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-0 focus-visible:outline-none">
            <SignupForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
