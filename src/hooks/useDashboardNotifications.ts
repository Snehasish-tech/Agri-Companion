import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DashboardNotificationType = "community" | "booking";

export interface DashboardNotification {
  id: string;
  type: DashboardNotificationType;
  text: string;
  time: string;
  createdAt: string;
  href: string;
}

function formatTimeAgo(dateString: string): string {
  const created = new Date(dateString).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - created);
  const mins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function useDashboardNotifications(userId?: string) {
  const sb = supabase as any;
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const [communityRes, bookingRes] = await Promise.all([
        sb
          .from("community_posts")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(4),
        sb
          .from("expert_bookings")
          .select("id, status, booking_date, created_at, experts(name)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(4),
      ]);

      const merged: DashboardNotification[] = [];

      if (!communityRes.error && communityRes.data) {
        for (const post of communityRes.data as Array<{ id: string; title: string; created_at: string }>) {
          merged.push({
            id: `community-${post.id}`,
            type: "community",
            text: `New community post: ${post.title}`,
            time: formatTimeAgo(post.created_at),
            createdAt: post.created_at,
            href: "/dashboard/community",
          });
        }
      }

      if (!bookingRes.error && bookingRes.data) {
        for (const booking of bookingRes.data as Array<{ id: string; status: string; booking_date: string; created_at: string; experts?: { name?: string } | null }>) {
          const expertName = booking.experts?.name || "Expert";
          const status = (booking.status || "pending").toLowerCase();
          merged.push({
            id: `booking-${booking.id}`,
            type: "booking",
            text: `Booking ${status} with ${expertName} (${booking.booking_date})`,
            time: formatTimeAgo(booking.created_at),
            createdAt: booking.created_at,
            href: "/dashboard/experts",
          });
        }
      }

      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(merged.slice(0, 8));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!userId) return;
    const timer = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(timer);
  }, [fetchNotifications, userId]);

  return {
    notifications,
    loading,
    refreshNotifications: fetchNotifications,
    clearNotifications,
  };
}
