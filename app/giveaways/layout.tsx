import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Vault",
};

export default function GiveawaysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}