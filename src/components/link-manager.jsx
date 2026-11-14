"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addLink, deleteLink, getLinks, normalizeUrl, updateLink } from "@/lib/data";

// 제목/URL 검증 — 추가와 수정에서 같이 사용
function validate({ title, url }) {
  if (!title.trim()) return { error: "링크 제목을 입력해 주세요." };
  if (!url.trim()) return { error: "링크 주소를 입력해 주세요." };
  const normalized = normalizeUrl(url);
  if (!normalized) return { error: "올바른 주소 형식이 아니에요. (예: instagram.com/me)" };
  return { value: { title: title.trim(), url: normalized } };
}

export function LinkManager({ uid }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);

  async function reload() {
    try {
      setLinks(await getLinks(uid));
    } catch (e) {
      setError("링크를 불러오지 못했어요: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);

  async function confirmDelete() {
    await deleteLink(uid, toDelete.id);
    setToDelete(null);
    reload();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>내 링크</CardTitle>
        <CardDescription>
          링크 {links.length}개 · 총 클릭 {totalClicks}회
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <AddLinkForm
          onAdd={async (data) => {
            await addLink(uid, data);
            reload();
          }}
        />

        {loading ? (
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        ) : links.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            아직 링크가 없어요. 위에서 첫 링크를 추가해 보세요!
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {links.map((link) => (
              <LinkRow
                key={link.id}
                link={link}
                onSave={async (data) => {
                  await updateLink(uid, link.id, data);
                  reload();
                }}
                onDelete={() => setToDelete(link)}
              />
            ))}
          </ul>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>

      {/* 삭제 확인 모달 */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>
              &quot;{toDelete?.title}&quot; 링크가 삭제됩니다.
              <br />
              <span className="font-medium text-destructive">이 작업은 되돌릴 수 없습니다.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>취소</Button>
            <Button variant="destructive" onClick={confirmDelete}>삭제하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function AddLinkForm({ onAdd }) {
  const [icon, setIcon] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const { error, value } = validate({ title, url });
    if (error) return setError(error);
    setBusy(true);
    setError("");
    try {
      await onAdd({ ...value, icon: icon.trim() });
      setIcon("");
      setTitle("");
      setUrl("");
    } catch (e) {
      setError("추가하지 못했어요: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
      <div className="flex gap-2">
        <Input className="w-14 text-center" placeholder="🔗" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={4} aria-label="아이콘" />
        <Input placeholder="링크 제목 (예: 인스타그램)" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} aria-label="링크 제목" />
      </div>
      <div className="flex gap-2">
        <Input placeholder="링크 주소 (예: instagram.com/me)" value={url} onChange={(e) => setUrl(e.target.value)} aria-label="링크 주소" />
        <Button type="submit" disabled={busy}>추가</Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}

function LinkRow({ link, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [icon, setIcon] = useState(link.icon);
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [error, setError] = useState("");

  function cancel() {
    setIcon(link.icon);
    setTitle(link.title);
    setUrl(link.url);
    setError("");
    setEditing(false);
  }

  async function save() {
    const { error, value } = validate({ title, url });
    if (error) return setError(error);
    try {
      await onSave({ ...value, icon: icon.trim() });
      setEditing(false);
    } catch (e) {
      setError("저장하지 못했어요: " + e.message);
    }
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 rounded-lg border p-3">
        <div className="flex gap-2">
          <Input className="w-14 text-center" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={4} aria-label="아이콘" />
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} aria-label="링크 제목" />
        </div>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} aria-label="링크 주소" />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={cancel}><X /> 취소</Button>
          <Button size="sm" onClick={save}><Check /> 저장</Button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border bg-background p-3">
      <span className="text-xl">{link.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{link.title}</p>
        <p className="truncate text-xs text-muted-foreground">{link.url}</p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">클릭 {link.clicks || 0}</span>
      <Button size="icon" variant="ghost" onClick={() => setEditing(true)} aria-label="수정"><Pencil /></Button>
      <Button size="icon" variant="ghost" onClick={onDelete} aria-label="삭제"><Trash2 className="text-destructive" /></Button>
    </li>
  );
}
