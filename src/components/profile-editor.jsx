"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveProfile, validateUsername } from "@/lib/data";

export function ProfileEditor({ uid, profile, onSaved }) {
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const name = username.trim().toLowerCase();
    const err = validateUsername(name);
    if (err) return setMessage({ type: "error", text: err });
    if (!displayName.trim()) return setMessage({ type: "error", text: "표시 이름을 입력해 주세요." });

    setSaving(true);
    setMessage(null);
    try {
      const next = { username: name, displayName: displayName.trim(), bio: bio.trim() };
      await saveProfile(uid, profile.username, next);
      setUsername(name);
      onSaved({ ...profile, ...next });
      setMessage({ type: "ok", text: "저장했어요!" });
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필</CardTitle>
        <CardDescription>공개 페이지 맨 위에 보이는 정보예요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">공유 URL</Label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">/</span>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="displayName">표시 이름</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">소개글</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={150} placeholder="안녕하세요!" />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>{saving ? "저장 중…" : "프로필 저장"}</Button>
            {message && (
              <span className={message.type === "ok" ? "text-sm text-green-600" : "text-sm text-destructive"}>
                {message.text}
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
