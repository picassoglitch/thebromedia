import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin | The Bro Media",
  robots: "noindex,nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
