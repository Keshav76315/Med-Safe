import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Shield, FileText, Activity, LogOut, Settings, ClipboardCheck, Database, Utensils, User, Bell, Lock, Moon, Sun, Monitor } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { OptimizedImage } from "./OptimizedImage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { NotificationBell } from "./NotificationBell";
import medSafeLogo from "@/assets/medsafe-logo.jpg";
import { useTheme } from "next-themes";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const baseNavItems = [
    { path: "/verify", label: "Drug Verification", icon: Shield },
    { path: "/history", label: "Medical History", icon: FileText },
    { path: "/safety", label: "Safety Score", icon: Activity },
    { path: "/diet", label: "Diet Recommendation", icon: Utensils },
  ];

  const pharmacistNavItems = (userRole === 'pharmacist' || userRole === 'admin') ? [
    { path: "/pharmacist", label: "Verifications", icon: ClipboardCheck }
  ] : [];

  const adminNavItems = userRole === 'admin' ? [
    { path: "/fda-import", label: "FDA Import", icon: Database }
  ] : [];

  const navItems = [...baseNavItems, ...pharmacistNavItems, ...adminNavItems];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <OptimizedImage 
                src={medSafeLogo} 
                alt="MedSafe Logo" 
                className="h-8 w-8 object-contain" 
                priority 
              />
              <span className="text-xl font-bold tracking-tight text-foreground">MedSafe</span>
            </Link>

            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
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
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && <NotificationBell />}
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      {userRole && (
                        <Badge variant="secondary" className="mt-1 capitalize w-fit">
                          {userRole}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Monitor className="w-4 h-4 mr-2" />
                      System Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme('light')}>
                        <Sun className="w-4 h-4 mr-2" />
                        Light
                        {theme === 'light' && <span className="ml-auto">✓</span>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('dark')}>
                        <Moon className="w-4 h-4 mr-2" />
                        Dark
                        {theme === 'dark' && <span className="ml-auto">✓</span>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('system')}>
                        <Monitor className="w-4 h-4 mr-2" />
                        System
                        {theme === 'system' && <span className="ml-auto">✓</span>}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuItem onClick={() => navigate('/settings/notifications')}>
                    <Bell className="w-4 h-4 mr-2" />
                    Notification Settings
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/settings/privacy')}>
                    <Lock className="w-4 h-4 mr-2" />
                    Privacy & Security
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
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
