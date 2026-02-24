import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "北即星 - 研发效能平台",
  description: "Pipeline configuration and workflow management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
