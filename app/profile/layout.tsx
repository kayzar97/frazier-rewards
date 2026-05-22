import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Frazier Rewards account and connections.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}