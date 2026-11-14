"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { isFirebaseConfigured } from "@/lib/firebase";
import { SetupNotice } from "@/components/setup-notice";

export default function Home() {
  const { user, profile, loading, error, login } = useAuth();
  if (!isFirebaseConfigured) return <SetupNotice />;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-5xl">🔗</div>
      <h1 className="text-3xl font-bold">마이링크</h1>
      <p className="text-muted-foreground">
        인스타그램, 유튜브, 블로그… 흩어진 링크를
        <br />
        나만의 주소 하나로 모아 공유하세요.
      </p>

      {loading ? (
        <p className="text-sm text-muted-foreground">불러오는 중…</p>
      ) : user ? (
        <div className="flex w-full flex-col gap-2">
          <Button asChild size="lg">
            <Link href="/dashboard">마이페이지로 가기</Link>
          </Button>
          {profile && (
            <Button asChild variant="outline" size="lg">
              <Link href={`/${profile.username}`}>내 공개 페이지 보기</Link>
            </Button>
          )}
        </div>
      ) : (
        <Button size="lg" className="w-full" onClick={login}>
          Google로 시작하기
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </main>
  );
}
