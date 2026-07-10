import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { markAllNotificationsAsRead, dismissNotification, setCurrentView, setNotifications } from '../store/careerSlice';
import { getNotifications, markNotificationAsRead } from '../api/notifications';
import { mapNotification } from '../utils/mappers';
import {
  Bell,
  Mail,
  ShieldCheck,
  CheckCheck,
  AlertTriangle,
  Settings,
  ChevronDown,
  Info,
  Calendar,
  Sparkles,
  Inbox,
  ShieldAlert,
  Clock,
} from 'lucide-react';

export default function NotificationsView() {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.career);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await getNotifications();
        const mapped = (response.data.notifications ?? []).map(mapNotification);
        dispatch(setNotifications(mapped));
      } catch {
        dispatch(setNotifications([]));
      } finally {
        setIsLoading(false);
      }
    };
    loadNotifications();
  }, [dispatch]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifs = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    if (filter === 'important') {
      return notifications.filter((n) => n.important);
    }
    return notifications;
  }, [notifications, filter]);

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((notification) => !notification.read);
    try {
      await Promise.all(unread.map((notification) => markNotificationAsRead(notification.id)));
      dispatch(markAllNotificationsAsRead());
    } catch {
      alert('Could not mark all notifications as read. Please try again.');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      dispatch(dismissNotification(id));
    } catch {
      alert('Could not update this notification. Please try again.');
    }
  };

  return (
    <div className="pt-24 pb-12 max-w-[1280px] mx-auto px-margin-desktop min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        
        {/* Left Sidebar: Filters & Settings */}
        <aside className="md:col-span-3 space-y-stack-lg">
          
          {/* Filter Navigation */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-4">Filters</h2>
            <nav className="space-y-1.5">
              <button
                onClick={() => setFilter('all')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-md cursor-pointer ${
                  filter === 'all'
                    ? 'bg-secondary-container text-on-secondary-container font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low transition-all'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Inbox size={18} />
                  <span>All</span>
                </span>
                <span className="bg-primary text-on-primary px-2 py-0.5 rounded-full text-xs font-bold">
                  {notifications.length}
                </span>
              </button>

              <button
                onClick={() => setFilter('unread')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-md cursor-pointer ${
                  filter === 'unread'
                    ? 'bg-secondary-container text-on-secondary-container font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low transition-all'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Bell size={18} />
                  <span>Unread</span>
                </span>
                <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-xs font-bold">
                  {unreadCount}
                </span>
              </button>

              <button
                onClick={() => setFilter('important')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-md cursor-pointer ${
                  filter === 'important'
                    ? 'bg-secondary-container text-on-secondary-container font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low transition-all'
                }`}
              >
                <span className="flex items-center gap-3">
                  <ShieldAlert size={18} />
                  <span>Important</span>
                </span>
              </button>
            </nav>
          </div>

          {/* Quick Preferences Links */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
            <h2 className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-4 text-xs font-bold">
              Preferences
            </h2>
            <ul className="space-y-3">
              <li>
                <a className="flex items-center gap-3 text-sm text-primary hover:underline py-1 cursor-pointer font-semibold">
                  <Settings size={16} />
                  <span>Manage notifications</span>
                </a>
              </li>
              <li>
                <a className="flex items-center gap-3 text-sm text-primary hover:underline py-1 cursor-pointer font-semibold">
                  <Mail size={16} />
                  <span>Email digest settings</span>
                </a>
              </li>
              <li>
                <a className="flex items-center gap-3 text-sm text-primary hover:underline py-1 cursor-pointer font-semibold">
                  <Clock size={16} />
                  <span>Quiet hours</span>
                </a>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content Feed Area */}
        <section className="md:col-span-9 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Notifications</h1>
              <p className="text-body-md text-on-surface-variant">Stay updated on your applications and job alerts.</p>
            </div>
            
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 text-primary border border-primary rounded-xl font-label-md hover:bg-primary/5 transition-colors cursor-pointer font-bold text-sm disabled:opacity-50"
            >
              <CheckCheck size={16} />
              <span>Mark all as read</span>
            </button>
          </div>

          {/* Notifications List container */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant p-8">
                Loading notifications...
              </div>
            ) : filteredNotifs.length > 0 ? (
              filteredNotifs.map((notif) => {
                const isImportant = notif.important;
                const isUnread = !notif.read;

                return (
                  <div
                    key={notif.id}
                    className={`group relative bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant flex gap-4 transition-all duration-200 ${
                      isImportant ? 'border-l-4 border-l-tertiary pl-4' : ''
                    } ${isUnread ? 'shadow-sm' : 'opacity-85'}`}
                  >
                    {/* Unread dot indicator */}
                    {isUnread && (
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}

                    {/* Sender Profile picture or Icon */}
                    <div className="shrink-0">
                      {notif.senderImage ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant bg-white">
                          <img src={notif.senderImage} alt={notif.senderName} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isImportant
                              ? 'bg-tertiary/10 text-tertiary'
                              : 'bg-secondary-container/40 text-primary'
                          }`}
                        >
                          {notif.type === 'security' ? (
                            <ShieldAlert size={22} />
                          ) : notif.type === 'message' ? (
                            <Mail size={22} />
                          ) : (
                            <Bell size={22} />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Copy content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <p className={`text-body-md text-on-surface text-sm sm:text-base ${isUnread ? 'font-bold' : 'font-medium'}`}>
                          {notif.title}
                        </p>
                        <span className="text-xs text-outline font-semibold whitespace-nowrap shrink-0 pt-0.5">
                          {notif.timeAgo}
                        </span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant text-sm leading-relaxed mb-3">
                        {notif.description}
                      </p>

                      {/* Interactive row CTAs based on message type */}
                      <div className="flex flex-wrap gap-2.5">
                        {notif.type === 'message' && (
                          <button
                            onClick={() => alert(`Replying to sender ${notif.senderName}...`)}
                            className="text-primary font-label-md hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <span>Reply to {notif.senderName?.split(' ')[0]}</span>
                          </button>
                        )}
                        {notif.type === 'security' && (
                          <button
                            onClick={() => alert('Verification Successful! Identity confirmed.')}
                            className="px-4 py-1.5 bg-tertiary text-on-tertiary rounded-lg text-xs font-bold hover:opacity-90 cursor-pointer shadow-sm"
                          >
                            Verify Identity
                          </button>
                        )}
                        {notif.type === 'alert' && (
                          <button
                            onClick={() => dispatch(setCurrentView('dashboard'))}
                            className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 cursor-pointer shadow-sm"
                          >
                            View Application Status
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(notif.id)}
                          className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-outline-variant p-8">
                <Bell className="mx-auto text-outline-variant mb-3" size={44} />
                <p className="font-headline-sm text-on-surface mb-1">Clean slate!</p>
                <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
                  You have no notifications in this category. We'll alert you as soon as there are updates!
                </p>
              </div>
            )}
          </div>

          {/* Load older notifications trigger */}
          {filteredNotifs.length > 0 && (
            <div className="py-6 flex justify-center">
              <button
                onClick={() => alert('All historical alerts are fully loaded.')}
                className="text-primary font-label-md font-bold text-sm bg-primary/5 hover:bg-primary/10 px-6 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>View older notifications</span>
                <ChevronDown size={16} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
