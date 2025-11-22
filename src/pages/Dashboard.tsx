import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { DashboardCard } from "@/components/DashboardCard";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { getDashboardStats } from "@/lib/api";
import { Pill, Users, ScanLine, AlertTriangle, CheckCircle, XCircle, Clock, Badge, ArrowRight, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [showDemo, setShowDemo] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
    loadRecentScans();
    loadChartData();
    
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

  async function loadChartData() {
    try {
      // Get scan trends for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: scanData, error } = await supabase
        .from('scan_logs')
        .select('timestamp, status')
        .gte('timestamp', sevenDaysAgo.toISOString());

      if (error) throw error;

      // Group by date
      const dateMap = new Map();
      scanData?.forEach((scan) => {
        const date = new Date(scan.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, verified: 0, counterfeit: 0, expired: 0, total: 0 });
        }
        const entry = dateMap.get(date);
        entry.total += 1;
        if (scan.status === 'verified') entry.verified += 1;
        if (scan.status === 'counterfeit') entry.counterfeit += 1;
        if (scan.status === 'expired') entry.expired += 1;
      });

      setChartData(Array.from(dateMap.values()));
    } catch (error) {
      console.error('Failed to load chart data:', error);
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" aria-hidden="true" />
                Recent Activity
              </h2>
              {recentScans.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/verify')}
                  aria-label="View all scans"
                >
                  View All
                </Button>
              )}
            </div>
            {recentScans.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <ScanLine className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">No recent scans yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Start verifying drug authenticity in seconds. Scan a QR code or enter a batch number to begin.
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/verify')}
                  size="lg"
                  className="mt-4"
                >
                  Start Verification
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    role="article"
                    aria-label={`Scan for ${scan.drugs?.name || 'Unknown Drug'}, status: ${scan.status}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0" aria-hidden="true">
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
                <span className="text-sm font-medium" title={new Date().toLocaleString()}>
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        {chartData.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Analytics & Trends</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Scan Trends Line Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Verification Trends (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem'
                        }} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="verified" stroke="hsl(var(--accent))" strokeWidth={2} name="Verified" />
                      <Line type="monotone" dataKey="counterfeit" stroke="hsl(var(--destructive))" strokeWidth={2} name="Counterfeit" />
                      <Line type="monotone" dataKey="expired" stroke="hsl(var(--warning))" strokeWidth={2} name="Expired" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Distribution Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Scan Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Scans" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Distribution Pie Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Overall Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Verified', value: stats?.verifiedScans || 0, color: 'hsl(var(--accent))' },
                          { name: 'Counterfeit', value: stats?.counterfeitDetected || 0, color: 'hsl(var(--destructive))' },
                          { name: 'Expired', value: stats?.expiredDetected || 0, color: 'hsl(var(--warning))' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Verified', value: stats?.verifiedScans || 0, color: 'hsl(var(--accent))' },
                          { name: 'Counterfeit', value: stats?.counterfeitDetected || 0, color: 'hsl(var(--destructive))' },
                          { name: 'Expired', value: stats?.expiredDetected || 0, color: 'hsl(var(--warning))' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem'
                        }} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
