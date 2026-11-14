"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { countClick, getLinks, getUserByUsername } from "@/lib/data";
import { isFirebaseConfigured } from "@/lib/firebase";
import { SetupNotice } from "@/components/setup-notice";

export default function PublicPage() {
  const { username } = useParams();
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    (async () => {
      try {
        const user = await getUserByUsername(decodeURIComponent(username).toLowerCase());
        if (!user) return setState({ status: "notfound" });
        const links = await getLinks(user.uid);
        setState({ status: "ok", user, links });
      } catch (e) {
        setState({ status: "error", message: e.message });
      }
    })();
  }, [username]);

  if (!isFirebaseConfigured) return <SetupNotice />;

  if (state.status === "loading") {
    return <p className="p-10 text-center text-sm text-muted-foreground">불러오는 중…</p>;
  }

  if (state.status !== "ok") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-5xl font-bold">404</p>
        <p className="text-muted-foreground">
          {state.status === "notfound" ? `"/${username}" 페이지를 찾을 수 없어요.` : state.message}
        </p>
        <Button asChild variant="outline">
          <Link href="/">마이링크 홈으로</Link>
        </Button>
      </main>
    );
  }

  const { user, links } = state;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-6 px-6 py-14">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
        {user.displayName?.[0] ?? "?"}
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold">{user.displayName}</h1>
        {user.bio && <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{user.bio}</p>}
      </div>

      <ul className="flex w-full flex-col gap-3">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => countClick(user.uid, link.id).catch(() => {})}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl border bg-background px-4 py-3 font-medium shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-xl">{link.icon}</span>
              <span className="flex-1 text-center">{link.title}</span>
              <span className="w-6" />
            </a>
          </li>
        ))}
        {links.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">아직 등록된 링크가 없어요.</p>
        )}
      </ul>

      <Link href="/" className="mt-auto text-xs text-muted-foreground hover:underline">
        🔗 마이링크로 나만의 페이지 만들기
      </Link>
    </main>
  );
}
