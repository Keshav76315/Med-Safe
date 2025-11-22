import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertTriangle,
  Upload,
  MapPin,
  TrendingUp,
  Award,
  Trophy,
  Shield,
  Clock,
  CheckCircle,
  Eye,
  FileSearch,
  Camera,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const reportSchema = z.object({
  drugName: z.string().trim().min(1, 'Drug name is required').max(200),
  batchNumber: z.string().trim().max(100).optional(),
  manufacturer: z.string().trim().max(200).optional(),
  locationAddress: z.string().trim().min(5, 'Detailed address is required').max(500),
  locationCity: z.string().trim().min(2, 'City is required').max(100),
  locationState: z.string().trim().min(2, 'State is required').max(100),
  purchaseLocation: z.string().trim().max(300).optional(),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  symptoms: z.string().trim().max(1000).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

interface CounterfeitReport {
  id: string;
  drug_name: string;
  batch_number?: string;
  location_city: string;
  location_state: string;
  status: string;
  severity: string;
  created_at: string;
  reward_points: number;
  is_verified: boolean;
}

interface UserReward {
  total_points: number;
  verified_reports_count: number;
  level: number;
  badges: any;
}

export default function CommunityReporting() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [reports, setReports] = useState<CounterfeitReport[]>([]);
  const [myReports, setMyReports] = useState<CounterfeitReport[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const [formData, setFormData] = useState({
    drugName: '',
    batchNumber: '',
    manufacturer: '',
    locationAddress: '',
    locationCity: '',
    locationState: '',
    purchaseLocation: '',
    description: '',
    symptoms: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });

  useEffect(() => {
    loadReports();
    if (user) {
      loadMyReports();
      loadUserRewards();
    }
  }, [user, filterStatus, filterSeverity]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('counterfeit_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (filterSeverity !== 'all') {
        query = query.eq('severity', filterSeverity);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyReports = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('counterfeit_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyReports(data || []);
    } catch (error) {
      console.error('Error loading my reports:', error);
    }
  };

  const loadUserRewards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserRewards(data);
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: `${file.name} is not an image`,
          variant: 'destructive',
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: `${file.name} exceeds 5MB`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    setUploadedPhotos(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 photos
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReport = async () => {
    // Validate form
    const validation = reportSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.issues[0].message,
        variant: 'destructive',
      });
      return;
    }

    if (!user && !isAnonymous) {
      toast({
        title: 'Login Required',
        description: 'Please login or submit anonymously',
        variant: 'destructive',
      });
      return;
    }

    if (isAnonymous && !reporterName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please provide your name for anonymous reports',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Upload photos to storage if any
      const photoUrls: string[] = [];
      
      if (uploadedPhotos.length > 0) {
        for (const photo of uploadedPhotos) {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `counterfeit-reports/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars') // Reusing existing bucket
            .upload(filePath, photo);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          photoUrls.push(publicUrl);
        }
      }

      // Submit report
      const { error: insertError } = await supabase
        .from('counterfeit_reports')
        .insert({
          user_id: isAnonymous ? null : user?.id,
          reporter_name: isAnonymous ? reporterName : null,
          is_anonymous: isAnonymous,
          drug_name: formData.drugName,
          batch_number: formData.batchNumber || null,
          manufacturer: formData.manufacturer || null,
          location_address: formData.locationAddress,
          location_city: formData.locationCity,
          location_state: formData.locationState,
          purchase_location: formData.purchaseLocation || null,
          description: formData.description,
          symptoms: formData.symptoms || null,
          severity: formData.severity,
          photo_urls: photoUrls.length > 0 ? photoUrls : null,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Report Submitted',
        description: 'Thank you for helping keep our community safe!',
      });

      // Reset form
      setFormData({
        drugName: '',
        batchNumber: '',
        manufacturer: '',
        locationAddress: '',
        locationCity: '',
        locationState: '',
        purchaseLocation: '',
        description: '',
        symptoms: '',
        severity: 'medium',
      });
      setUploadedPhotos([]);
      setReporterName('');

      loadReports();
      if (user) {
        loadMyReports();
      }

    } catch (error: any) {
      console.error('Report submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Could not submit report',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      submitted: 'secondary',
      under_review: 'default',
      investigated: 'outline',
      resolved: 'default',
    };
    return variants[status] || 'secondary';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-destructive';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Community Counterfeit Reporting</h1>
          <p className="text-muted-foreground text-lg">
            Help protect others by reporting suspicious medications
          </p>
        </div>

        <Tabs defaultValue="report" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="report">Report Drug</TabsTrigger>
            <TabsTrigger value="map">Counterfeit Map</TabsTrigger>
            <TabsTrigger value="my-reports">My Reports</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Report Submission Tab */}
          <TabsContent value="report" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Rewards Card */}
              {user && userRewards && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Your Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Level</span>
                      <Badge variant="default" className="text-lg">{userRewards.level}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Points</span>
                      <span className="text-2xl font-bold text-primary">{userRewards.total_points}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Verified Reports</span>
                      <span className="text-xl font-semibold">{userRewards.verified_reports_count}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Points Info */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Earn Rewards
                  </CardTitle>
                  <CardDescription>Points awarded when your report is verified</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { severity: 'Critical', points: 100, color: 'text-destructive' },
                      { severity: 'High', points: 75, color: 'text-orange-500' },
                      { severity: 'Medium', points: 50, color: 'text-yellow-600' },
                      { severity: 'Low', points: 25, color: 'text-blue-500' },
                    ].map((item) => (
                      <div key={item.severity} className="text-center p-3 border rounded-lg">
                        <div className={cn('text-2xl font-bold', item.color)}>{item.points}</div>
                        <div className="text-sm text-muted-foreground">{item.severity}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Form */}
            <Card>
              <CardHeader>
                <CardTitle>Submit Counterfeit Report</CardTitle>
                <CardDescription>
                  Provide detailed information to help authorities investigate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Anonymous Toggle */}
                {!user && (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div>
                      <Label>Submit Anonymously</Label>
                      <p className="text-sm text-muted-foreground">Report without creating an account</p>
                    </div>
                    <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                  </div>
                )}

                {isAnonymous && (
                  <div>
                    <Label htmlFor="reporterName">Your Name *</Label>
                    <Input
                      id="reporterName"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="Required for anonymous reports"
                    />
                  </div>
                )}

                {/* Drug Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Drug Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="drugName">Drug Name *</Label>
                      <Input
                        id="drugName"
                        value={formData.drugName}
                        onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
                        placeholder="Name of suspected counterfeit drug"
                      />
                    </div>

                    <div>
                      <Label htmlFor="batchNumber">Batch Number</Label>
                      <Input
                        id="batchNumber"
                        value={formData.batchNumber}
                        onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                        placeholder="If available"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="manufacturer">Manufacturer</Label>
                      <Input
                        id="manufacturer"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        placeholder="Manufacturer name on packaging"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="locationAddress">Address *</Label>
                      <Textarea
                        id="locationAddress"
                        value={formData.locationAddress}
                        onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                        placeholder="Where the counterfeit was found"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="locationCity">City *</Label>
                      <Input
                        id="locationCity"
                        value={formData.locationCity}
                        onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="locationState">State *</Label>
                      <Input
                        id="locationState"
                        value={formData.locationState}
                        onChange={(e) => setFormData({ ...formData, locationState: e.target.value })}
                        placeholder="e.g., Maharashtra, Delhi"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="purchaseLocation">Purchase Location</Label>
                      <Input
                        id="purchaseLocation"
                        value={formData.purchaseLocation}
                        onChange={(e) => setFormData({ ...formData, purchaseLocation: e.target.value })}
                        placeholder="Pharmacy/store name where purchased"
                      />
                    </div>
                  </div>
                </div>

                {/* Report Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileSearch className="h-4 w-4" />
                    Report Details
                  </h3>

                  <div>
                    <Label htmlFor="severity">Severity *</Label>
                    <Select value={formData.severity} onValueChange={(value: any) => setFormData({ ...formData, severity: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Minor concerns</SelectItem>
                        <SelectItem value="medium">Medium - Suspicious characteristics</SelectItem>
                        <SelectItem value="high">High - Strong evidence of counterfeiting</SelectItem>
                        <SelectItem value="critical">Critical - Immediate health risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what makes you suspect this is counterfeit (packaging issues, unusual effects, etc.)"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="symptoms">Symptoms Experienced</Label>
                    <Textarea
                      id="symptoms"
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                      placeholder="Any adverse effects experienced (optional)"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Photo Evidence (Optional)
                  </h3>
                  
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-medium mb-1">Upload Photos</p>
                      <p className="text-sm text-muted-foreground">
                        Up to 5 photos, max 5MB each
                      </p>
                    </label>
                  </div>

                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {uploadedPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSubmitReport}
                  disabled={submitting}
                  size="lg"
                  className="w-full"
                >
                  {submitting ? 'Submitting Report...' : 'Submit Report'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Counterfeit Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Counterfeit Heatmap</CardTitle>
                    <CardDescription>Interactive map showing reported counterfeit locations</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="investigated">Investigated</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Simplified map visualization - list view */}
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading reports...</p>
                  ) : reports.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No reports found</p>
                  ) : (
                    reports.map((report) => (
                      <Card key={report.id} className="hover:border-primary transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{report.drug_name}</h4>
                                <Badge variant={getStatusBadge(report.status)}>
                                  {report.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {report.location_city}, {report.location_state}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {new Date(report.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={cn('text-sm font-semibold', getSeverityColor(report.severity))}>
                                {report.severity.toUpperCase()}
                              </span>
                              {report.is_verified && (
                                <Badge variant="default" className="bg-accent">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Reports Tab */}
          <TabsContent value="my-reports" className="space-y-6">
            {!user ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Login to view your reports</p>
                  <Button onClick={() => window.location.href = '/auth'} className="mt-4">
                    Login
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Your Reports</CardTitle>
                  <CardDescription>Track the status of your submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  {myReports.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No reports yet</p>
                  ) : (
                    <div className="space-y-3">
                      {myReports.map((report) => (
                        <Card key={report.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <h4 className="font-semibold">{report.drug_name}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <Badge variant={getStatusBadge(report.status)}>
                                    {report.status.replace('_', ' ')}
                                  </Badge>
                                  <span>{report.location_city}, {report.location_state}</span>
                                  <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                {report.is_verified && (
                                  <>
                                    <div className="text-2xl font-bold text-primary">
                                      +{report.reward_points}
                                    </div>
                                    <div className="text-sm text-muted-foreground">points</div>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Top Contributors
                </CardTitle>
                <CardDescription>
                  Community members making the biggest impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Leaderboard coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
