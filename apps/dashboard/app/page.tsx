import { redirect } from "next/navigation";

/**
 * Root route redirects to /inbox per the locked product flow:
 * Sagar opens the dashboard, lands on Inbox (the highest-frequency surface).
 * Broadcasts and Settings reachable via rail.
 */
export default function HomePage() {
  redirect("/inbox");
}
