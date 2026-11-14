// Firestore 데이터 구조
//   users/{userId}                 ← 프로필 (username, displayName, bio)
//   users/{userId}/links/{linkId}  ← 링크 (title, url, icon, clicks, createdAt, updatedAt)
//   usernames/{username}           ← { uid }  /username → userId 매핑 + 중복 방지
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";

export const USERNAME_RULE = /^[a-z0-9_]{3,20}$/;
const RESERVED = new Set(["dashboard", "api", "login", "admin", "_next", "favicon.ico"]);

export function validateUsername(name) {
  if (!USERNAME_RULE.test(name)) return "영문 소문자, 숫자, _ 로 3~20자만 쓸 수 있어요.";
  if (RESERVED.has(name)) return "사용할 수 없는 이름이에요.";
  return null;
}

// 이메일 앞부분으로 username 기본값 만들기
function usernameFromEmail(email = "") {
  let base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 16);
  if (base.length < 3) base = (base + "user").slice(0, 16);
  if (RESERVED.has(base)) base = base + "_1";
  return base;
}

// 로그인 직후 호출: 프로필이 없으면 username/displayName 자동 생성
export async function ensureProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return snap.data();

  const base = usernameFromEmail(user.email);
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? base : `${base}${Math.floor(Math.random() * 9000 + 1000)}`;
    try {
      const profile = await runTransaction(db, async (tx) => {
        const nameRef = doc(db, "usernames", candidate);
        if ((await tx.get(nameRef)).exists()) throw new Error("taken");
        const data = {
          username: candidate,
          displayName: user.displayName || candidate,
          bio: "",
          createdAt: serverTimestamp(),
        };
        tx.set(nameRef, { uid: user.uid });
        tx.set(userRef, data);
        return data;
      });
      return profile;
    } catch (e) {
      if (e.message !== "taken") throw e;
    }
  }
  throw new Error("username 자동 생성에 실패했어요. 다시 로그인해 주세요.");
}

// 프로필 수정 (username 바뀌면 중복 체크 후 매핑 교체)
export async function saveProfile(uid, oldUsername, { username, displayName, bio }) {
  const userRef = doc(db, "users", uid);
  await runTransaction(db, async (tx) => {
    if (username !== oldUsername) {
      const newRef = doc(db, "usernames", username);
      if ((await tx.get(newRef)).exists()) throw new Error("이미 사용 중인 username 이에요.");
      tx.set(newRef, { uid });
      if (oldUsername) tx.delete(doc(db, "usernames", oldUsername));
    }
    tx.update(userRef, { username, displayName, bio });
  });
}

export async function getUserByUsername(username) {
  const nameSnap = await getDoc(doc(db, "usernames", username));
  if (!nameSnap.exists()) return null;
  const uid = nameSnap.data().uid;
  const userSnap = await getDoc(doc(db, "users", uid));
  if (!userSnap.exists()) return null;
  return { uid, ...userSnap.data() };
}

// ---------- 링크 CRUD ----------
const linksCol = (uid) => collection(db, "users", uid, "links");

export async function getLinks(uid) {
  const snap = await getDocs(query(linksCol(uid), orderBy("createdAt", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function addLink(uid, { title, url, icon }) {
  return addDoc(linksCol(uid), {
    title,
    url,
    icon: icon || "🔗",
    clicks: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateLink(uid, linkId, { title, url, icon }) {
  return updateDoc(doc(db, "users", uid, "links", linkId), {
    title,
    url,
    icon: icon || "🔗",
    updatedAt: serverTimestamp(),
  });
}

export function deleteLink(uid, linkId) {
  return deleteDoc(doc(db, "users", uid, "links", linkId));
}

// 클릭 통계: 누구나 +1 만 가능 (firestore.rules 참고)
export function countClick(uid, linkId) {
  return updateDoc(doc(db, "users", uid, "links", linkId), { clicks: increment(1) });
}

// URL 검증: https:// 가 없으면 붙여주고, 형식이 틀리면 null
export function normalizeUrl(raw) {
  const value = raw.trim();
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const u = new URL(withScheme);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}
