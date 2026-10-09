import type { Metadata } from "next";
import "./app.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "BayList",
  description: "My Used Gear Inventory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
