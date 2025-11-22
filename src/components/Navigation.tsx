import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Shield, FileText, Activity, LogOut, User, ClipboardCheck, Database, Utensils, Menu, Settings, Moon, Bell, Lock, FlaskConical, MoreHorizontal, Pill, AlertCircle, Users, UserCog, MapPin, FileSearch } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { OptimizedImage } from "./OptimizedImage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Badge } from "./ui/badge";
import { NotificationBell } from "./NotificationBell";
import { useIsMobile } from "@/hooks/use-mobile";
import medSafeLogo from "@/assets/medsafe-logo-transparent.png";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const isMobile = useIsMobile();

  // High priority items - always visible
  const primaryNavItems = [
    { path: "/verify", label: "Verify", icon: Shield },
    { path: "/interactions", label: "Interactions", icon: FlaskConical },
    { path: "/prescription-scanner", label: "Prescriptions", icon: Pill },
  ];

  // Lower priority items - in "More" dropdown
  const secondaryNavItems = [
    { path: "/history", label: "Medical History", icon: FileText },
    { path: "/safety", label: "Safety Score", icon: Activity },
    { path: "/diet", label: "Diet Recommendation", icon: Utensils },
    { path: "/community-reports", label: "Community Reports", icon: MapPin },
    { path: "/pharmacy-locator", label: "Pharmacy Locator", icon: MapPin },
  ];

  const pharmacistNavItems = (userRole === 'pharmacist' || userRole === 'admin') ? [
    { path: "/pharmacist", label: "Pharmacist Verifications", icon: ClipboardCheck }
  ] : [];

  const adminNavItems = userRole === 'admin' ? [
    { path: "/fda-import", label: "FDA Drug Import", icon: Database }
  ] : [];

  const moreMenuItems = [...secondaryNavItems, ...pharmacistNavItems, ...adminNavItems];
  const allNavItems = [...primaryNavItems, ...moreMenuItems];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <OptimizedImage 
                src={medSafeLogo} 
                alt="MedSafe Logo" 
                className="h-10 w-10 object-contain" 
                priority 
              />
              <span className="text-lg md:text-xl font-bold tracking-tight text-foreground">MedSafe</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* More dropdown menu */}
              {moreMenuItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 text-sm font-medium",
                        moreMenuItems.some(item => location.pathname === item.path)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span>More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card z-50">
                    {moreMenuItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      const isFirstPharmacist = item.path === "/pharmacist" && index > 0;
                      const isFirstAdmin = item.path === "/fda-import" && index > 0;

                      return (
                        <div key={item.path}>
                          {(isFirstPharmacist || isFirstAdmin) && <DropdownMenuSeparator />}
                          <DropdownMenuItem
                            onClick={() => navigate(item.path)}
                            className={cn(
                              "cursor-pointer",
                              isActive && "bg-muted"
                            )}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {item.label}
                          </DropdownMenuItem>
                        </div>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Hamburger Menu */}
            {isMobile && user && (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Navigation</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4 space-y-2">
                    {allNavItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      const isFirstPharmacist = item.path === "/pharmacist" && index > 0;
                      const isFirstAdmin = item.path === "/fda-import" && index > 0;

                      return (
                        <div key={item.path}>
                          {(isFirstPharmacist || isFirstAdmin) && (
                            <div className="my-2 border-t border-border" />
                          )}
                          <DrawerClose asChild>
                            <Link
                              to={item.path}
                              className={cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors w-full",
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              <span>{item.label}</span>
                            </Link>
                          </DrawerClose>
                        </div>
                      );
                    })}
                  </div>
                </DrawerContent>
              </Drawer>
            )}

            {/* Emergency Button - Always Visible */}
            <Link to="/emergency">
              <Button variant="destructive" size={isMobile ? "icon" : "default"} className="font-semibold">
                <AlertCircle className="h-5 w-5" />
                {!isMobile && <span className="ml-2">Emergency</span>}
              </Button>
            </Link>

            {user && <NotificationBell />}
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card z-50">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      {userRole && (
                        <Badge variant="secondary" className="w-fit capitalize text-xs">
                          {userRole}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings/theme')}>
                    <Moon className="w-4 h-4 mr-2" />
                    System Theme
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings/notifications')}>
                    <Bell className="w-4 h-4 mr-2" />
                    Notification Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings/security')}>
                    <Lock className="w-4 h-4 mr-2" />
                    Privacy & Security
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings/family')}>
                    <Users className="w-4 h-4 mr-2" />
                    Family Members
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings/caregivers')}>
                    <UserCog className="w-4 h-4 mr-2" />
                    Caregivers
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
