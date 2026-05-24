"use client";

import type { components } from "@/lib/api/schema";
import { NotificationsList } from "@/components/NotificationsList";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";

type Notification = components["schemas"]["NotificationPublic"];

export function NotificationsInbox({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const { refresh } = useUnreadNotificationCount();
  return (
    <NotificationsList
      initialNotifications={initialNotifications}
      onReadChange={refresh}
    />
  );
}
