import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DashboardCard } from "@/components/DashboardCard";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { getDashboardStats } from "@/lib/api";
import { Pill, Users, ScanLine, AlertTriangle, CheckCircle, XCircle, Clock, Badge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Badge as BadgeUI } from "@/components/ui/badge";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [showDemo, setShowDemo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
    loadRecentScans();
    
    // Check if we should show demo for new user
    const shouldShowDemo = localStorage.getItem('showDemo');
    if (shouldShowDemo === 'true') {
      setShowDemo(true);
      localStorage.removeItem('showDemo');
    }
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

  async function loadRecentScans() {
    try {
      const { data, error } = await supabase
        .from('scan_logs')
        .select('id, scan_id, batch_no, status, timestamp, drugs(name)')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentScans(data || []);
    } catch (error) {
      console.error('Failed to load recent scans:', error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'default';
      case 'counterfeit':
        return 'destructive';
      case 'expired':
        return 'secondary';
      case 'not_found':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'counterfeit':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <ScanLine className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <InteractiveDemo isOpen={showDemo} onClose={() => setShowDemo(false)} />

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
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </h2>
            {recentScans.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent scans yet</p>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getStatusIcon(scan.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {scan.drugs?.name || 'Unknown Drug'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Batch: {scan.batch_no}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <BadgeUI variant={getStatusColor(scan.status) as any} className="text-xs">
                        {scan.status}
                      </BadgeUI>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
