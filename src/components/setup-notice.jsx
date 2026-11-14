export function SetupNotice() {
  return (
    <main className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="text-xl font-bold">Firebase 설정이 필요해요</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        <code>env.local.example</code> 을 복사해 <code>.env.local</code> 을 만들고 Firebase 웹 앱
        설정 값을 넣은 뒤 <code>npm run dev</code> 를 다시 실행하세요.
      </p>
    </main>
  );
}
