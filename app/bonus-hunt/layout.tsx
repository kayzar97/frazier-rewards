import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bonus Hunt",
};

export default function BonusHuntLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}