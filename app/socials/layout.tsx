import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Socials",
  description: "Follow Frazier Rewards across all platforms.",
};

export default function SocialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}