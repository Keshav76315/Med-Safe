import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Shield, FileText, Activity, LogOut, User, ClipboardCheck, Database } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { NotificationBell } from "./NotificationBell";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();

  const baseNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/verify", label: "Drug Verification", icon: Shield },
    { path: "/history", label: "Medical History", icon: FileText },
    { path: "/safety", label: "Safety Score", icon: Activity },
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
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground">MediSafe</span>
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
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user.email}</p>
                    {userRole && (
                      <Badge variant="secondary" className="mt-1 capitalize">
                        {userRole}
                      </Badge>
                    )}
                  </div>
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
