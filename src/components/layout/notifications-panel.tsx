'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  PATIENT_NOTIFICATIONS_CHANGED,
  type PatientNotification,
} from '@/lib/mock/notifications';
import { formatDateTime } from '@/lib/format-date';

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  function refresh() {
    setNotifications(getNotifications());
    setUnread(getUnreadCount());
  }

  useEffect(() => {
    refresh();
    const onChanged = () => refresh();
    window.addEventListener(PATIENT_NOTIFICATIONS_CHANGED, onChanged);
    return () => window.removeEventListener(PATIENT_NOTIFICATIONS_CHANGED, onChanged);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) refresh();
  }

  function handleClick(notif: PatientNotification) {
    markNotificationRead(notif.id);
    refresh();
    setOpen(false);
  }

  function handleMarkAllRead() {
    markAllNotificationsRead();
    refresh();
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white/80 hover:bg-white/10 hover:text-white">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 border-0 bg-red-500 px-1 text-[10px] text-white">
              {unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5 text-sm font-semibold">
          <span>Notifications</span>
          {unread > 0 && (
            <button
              type="button"
              className="text-xs font-normal text-primary hover:underline"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">No notifications</p>
        ) : (
          notifications.map((notif) => (
            <DropdownMenuItem key={notif.id} asChild className={notif.read ? 'opacity-60' : ''}>
              {notif.href ? (
                <Link href={notif.href} onClick={() => handleClick(notif)} className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-medium">{notif.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
                  <span className="text-[10px] text-muted-foreground">{formatDateTime(notif.timestamp)}</span>
                </Link>
              ) : (
                <div className="flex flex-col items-start gap-0.5" onClick={() => handleClick(notif)}>
                  <span className="text-sm font-medium">{notif.title}</span>
                  <span className="text-xs text-muted-foreground">{notif.message}</span>
                </div>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
