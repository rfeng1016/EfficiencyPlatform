import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Efficiency Platform",
  description: "Pipeline configuration and workflow management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
