import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft as ChevronLeft, Warning as AlertTriangle, Phone, Chat as MessageSquare, Bell, Link as LinkIcon, Users } from "@phosphor-icons/react/dist/ssr";
import { getBroadcastById } from "@/lib/data";
import { BroadcastDetailClient } from "./detail-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BroadcastDetailPage({
  params,
}: {
  params: { broadcastId: string };
}) {
  const b = await getBroadcastById(params.broadcastId);
  if (!b) notFound();
  return <BroadcastDetailClient broadcast={b} />;
}
