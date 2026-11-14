"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { ProfileEditor } from "@/components/profile-editor";
import { LinkManager } from "@/components/link-manager";
import { isFirebaseConfigured } from "@/lib/firebase";
import { SetupNotice } from "@/components/setup-notice";

export default function Dashboard() {
  const { user, profile, setProfile, loading, logout } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);
  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (!isFirebaseConfigured) return <SetupNotice />;
  if (loading || !user || !profile) {
    return <p className="p-10 text-center text-sm text-muted-foreground">불러오는 중…</p>;
  }

  const shareUrl = `${origin}/${profile.username}`;

  async function copy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">마이페이지</h1>
        <Button variant="ghost" size="sm" onClick={logout}>로그아웃</Button>
      </header>

      <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
        <span className="min-w-0 flex-1 truncate text-sm">{shareUrl}</span>
        <Button size="sm" variant="outline" onClick={copy}>{copied ? "복사됨!" : "복사"}</Button>
        <Button size="sm" asChild>
          <Link href={`/${profile.username}`} target="_blank">보기</Link>
        </Button>
      </div>

      <ProfileEditor key={profile.username} uid={user.uid} profile={profile} onSaved={setProfile} />
      <LinkManager uid={user.uid} />
    </main>
  );
}
