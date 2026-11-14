import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const metadata = {
  title: "마이링크",
  description: "여러 링크를 한 페이지에 모아 공유하세요",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-neutral-50 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
