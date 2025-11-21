import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger";
}

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
}: DashboardCardProps) {
  const variantStyles = {
    default: "border-border",
    success: "border-accent/50 bg-accent/5",
    warning: "border-warning/50 bg-warning/5",
    danger: "border-destructive/50 bg-destructive/5",
  };

  const iconVariants = {
    default: "text-primary",
    success: "text-accent",
    warning: "text-warning",
    danger: "text-destructive",
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", iconVariants[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <p
            className={cn(
              "text-xs mt-2 font-medium",
              trend.isPositive ? "text-accent" : "text-destructive"
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
            {trend.isPositive ? "increase" : "decrease"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
