import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DashboardCard } from "@/components/DashboardCard";
import { getDashboardStats } from "@/lib/api";
import { Pill, Users, ScanLine, AlertTriangle, CheckCircle, XCircle, Shield, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Monitor drug verification and patient safety metrics
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              title="Total Drugs in Database"
              value={stats?.totalDrugs || 0}
              description="Registered medications"
              icon={Pill}
              variant="default"
            />

            <DashboardCard
              title="Patient Records"
              value={stats?.totalPatients || 0}
              description="Medical histories tracked"
              icon={Users}
              variant="default"
            />

            <DashboardCard
              title="Total Scans"
              value={stats?.totalScans || 0}
              description="Verification attempts"
              icon={ScanLine}
              variant="default"
            />

            <DashboardCard
              title="Verified Authentic"
              value={stats?.verifiedScans || 0}
              description="Safe medications confirmed"
              icon={CheckCircle}
              variant="success"
            />

            <DashboardCard
              title="Counterfeit Detected"
              value={stats?.counterfeitDetected || 0}
              description="Fake drugs identified"
              icon={XCircle}
              variant="danger"
            />

            <DashboardCard
              title="Expired Medications"
              value={stats?.expiredDetected || 0}
              description="Out-of-date drugs found"
              icon={AlertTriangle}
              variant="warning"
            />
          </div>
        )}

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/verify"
                className="block p-4 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Verify Drug</p>
                    <p className="text-sm opacity-90">Scan or enter batch number</p>
                  </div>
                </div>
              </a>

              <a
                href="/history"
                className="block p-4 rounded-md bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Manage Patient History</p>
                    <p className="text-sm text-muted-foreground">Add or update records</p>
                  </div>
                </div>
              </a>

              <a
                href="/safety"
                className="block p-4 rounded-md bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Calculate Safety Score</p>
                    <p className="text-sm text-muted-foreground">Assess medication risks</p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database Connection</span>
                <span className="flex items-center text-accent text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Drug Database</span>
                <span className="text-sm font-medium">{stats?.totalDrugs || 0} entries</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Scan Success Rate</span>
                <span className="text-accent text-sm font-medium">
                  {stats?.totalScans > 0
                    ? Math.round((stats.verifiedScans / stats.totalScans) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
