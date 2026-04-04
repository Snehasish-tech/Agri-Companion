import { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Wheat, Bot, CloudSun, TrendingUp, ShoppingCart,
  Warehouse, Handshake, MessageCircle, Users, BookOpen, Receipt, Briefcase,
  Settings, Bell, Search, ChevronLeft, ChevronRight, LogOut, Menu, X,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useDashboardNotifications } from "@/hooks/useDashboardNotifications";
import { useTranslation } from "react-i18next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const menuItems = [
  { icon: LayoutDashboard, labelKey: "sidebar.dashboard", path: "/dashboard" },
  { icon: Wheat, labelKey: "sidebar.myFarms", path: "/dashboard/farms" },
  { icon: Bot, labelKey: "sidebar.aiRecommendations", path: "/dashboard/ai" },
  { icon: CloudSun, labelKey: "sidebar.weatherInsights", path: "/dashboard/weather" },
  { icon: TrendingUp, labelKey: "sidebar.marketPrices", path: "/dashboard/market" },
  { icon: ShoppingCart, labelKey: "sidebar.marketplace", path: "/dashboard/shop" },
  { icon: Warehouse, labelKey: "sidebar.storage", path: "/dashboard/storage" },
  { icon: Handshake, labelKey: "sidebar.farmerToMarket", path: "/dashboard/sell" },
  { icon: Briefcase, labelKey: "sidebar.expertConsultancy", path: "/dashboard/experts" },
  { icon: MessageCircle, labelKey: "sidebar.aiChatbot", path: "/dashboard/chat" },
  { icon: Users, labelKey: "sidebar.community", path: "/dashboard/community" },
  { icon: BookOpen, labelKey: "sidebar.knowledgeBase", path: "/dashboard/learn" },
  { icon: Receipt, labelKey: "sidebar.ordersAndSales", path: "/dashboard/orders" },
  { icon: Settings, labelKey: "sidebar.settings", path: "/dashboard/settings" },
];

export default function DashboardLayout() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const showGlobalSearch = /^\/dashboard\/?$/.test(location.pathname);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { notifications, loading: notificationsLoading } = useDashboardNotifications(user?.id);
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [avatarUserId, setAvatarUserId] = useState<string | null>(user?.id || null);

  useEffect(() => {
    if (!user?.id) {
      setAvatarUserId(null);
      setResolvedAvatarUrl(null);
      return;
    }

    // If account changed, sync immediately with the new account state.
    if (avatarUserId !== user.id) {
      setAvatarUserId(user.id);
      setResolvedAvatarUrl(user.avatar_url || null);
      return;
    }

    // Same account: only update when we have a real avatar URL.
    // This avoids brief fallback initials flash during token refresh/profile hydration.
    if (user.avatar_url) {
      setResolvedAvatarUrl(user.avatar_url);
    }
  }, [avatarUserId, user?.avatar_url, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setResolvedAvatarUrl(null);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (isMounted && data?.avatar_url) {
          setResolvedAvatarUrl(data.avatar_url);
        }
      } catch {
        // Keep context value if profile lookup fails.
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const displayName = user?.full_name || user?.email || "User";
  const initials = (displayName || "U").split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <BrandLogo size={collapsed ? "sm" : "md"} animated={false} />
        </Link>
        <button className="lg:hidden ml-auto text-sidebar-foreground" onClick={() => setMobileOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-4 border-t border-sidebar-border pt-3 shrink-0 space-y-1">
        <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full overflow-hidden gradient-warm flex items-center justify-center text-secondary-foreground font-heading font-bold text-xs shrink-0">
            {resolvedAvatarUrl ? (
              <img src={resolvedAvatarUrl} alt="User profile" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{displayName}</p>
              <p className="text-[10px] text-sidebar-foreground/50">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{t("sidebar.signOut")}</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>{t("sidebar.collapse")}</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-64"} bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 hidden lg:flex flex-col fixed h-screen z-40`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col animate-slide-in-right">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 ${collapsed ? "lg:ml-16" : "lg:ml-64"} transition-all duration-300`}>
        {/* Top bar */}
        <header className="h-14 sm:h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-3 sm:px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            {showGlobalSearch && (
              <div className="hidden sm:flex items-center gap-3 bg-muted/70 rounded-xl px-3 py-2 w-full max-w-[28rem]">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("topbar.searchPlaceholder")}
                  className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <ThemeToggle className="text-muted-foreground" />
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center">
                    {Math.min(notifications.length, 9)}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full max-w-sm sm:w-80 p-0" align="end">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h4 className="font-heading font-bold text-sm">{t("notifications.title")}</h4>
                  <button onClick={() => navigate("/dashboard")} className="text-[10px] text-primary hover:underline font-medium">{t("notifications.viewAll")}</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-4 text-xs text-muted-foreground">{t("notifications.loading")}</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-xs text-muted-foreground">{t("notifications.empty")}</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => navigate(n.href)}
                        className="p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <p className="text-xs text-foreground leading-snug">{n.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <button onClick={() => navigate("/dashboard/settings")} className="w-8 h-8 rounded-full overflow-hidden gradient-hero flex items-center justify-center text-primary-foreground font-heading font-bold text-xs hover:opacity-90 transition-all border-2 border-transparent hover:border-primary/20 focus:outline-none">
              {resolvedAvatarUrl ? (
                <img src={resolvedAvatarUrl} alt="User profile" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </button>
          </div>
        </header>

        <main className="p-3 sm:p-4 md:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}