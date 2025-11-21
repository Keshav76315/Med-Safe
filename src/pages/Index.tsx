import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Sparkles, Camera, QrCode, ImageIcon, Info, History, Settings as SettingsIcon, HelpCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to dashboard if already logged in
  if (user) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <section className="relative bg-gradient-to-br from-primary via-blue-600 to-cyan-500 text-white pt-20 pb-32 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Medicine Safety</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            Welcome to <span className="text-cyan-200">MedSafe</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12">
            Your intelligent companion for medicine safety. Scan, analyze, and get personalized
            recommendations based on age and health needs.
          </p>

          {/* Main Feature Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Drug Verification Card */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl -mr-24 -mt-24" />
              <CardHeader className="relative">
                <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Scan Medicine</CardTitle>
                <CardDescription className="text-white/80 text-base">
                  Take a photo of your medicine packaging to instantly extract information and get age-appropriate safety recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button 
                  onClick={() => navigate("/verify")}
                  className="bg-blue-600 hover:bg-blue-700 text-white group"
                  size="lg"
                >
                  Start Scanning
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* Medicine Information Card */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl -mr-24 -mt-24" />
              <CardHeader className="relative">
                <div className="bg-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">AI Information</CardTitle>
                <CardDescription className="text-white/80 text-base">
                  Search or scan medicine names to get comprehensive AI-powered details including uses, dosage, and safety warnings.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button 
                  onClick={() => navigate("/verify")}
                  className="bg-purple-600 hover:bg-purple-700 text-white group"
                  size="lg"
                >
                  Start Searching
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="bg-background py-8 px-4 -mt-16">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              size="lg"
              className="h-auto py-4 bg-background hover:bg-muted"
              onClick={() => navigate("/verify")}
            >
              <History className="mr-2 h-5 w-5" />
              <span className="text-base font-medium">View Scan History</span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="h-auto py-4 bg-background hover:bg-muted"
              onClick={() => navigate("/history")}
            >
              <SettingsIcon className="mr-2 h-5 w-5" />
              <span className="text-base font-medium">Medical History</span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="h-auto py-4 bg-background hover:bg-muted"
              onClick={() => navigate("/safety")}
            >
              <HelpCircle className="mr-2 h-5 w-5" />
              <span className="text-base font-medium">Safety Score</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="bg-muted/30 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: Batch Verification */}
            <Card className="bg-background hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-blue-500 w-14 h-14 rounded-xl flex items-center justify-center mb-3">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-lg">Batch Verification</CardTitle>
                <CardDescription className="text-sm">
                  Verify medication authenticity using batch numbers and QR codes
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2: QR Code Scan */}
            <Card className="bg-background hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-3">
                  <QrCode className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-lg">QR Code Scan</CardTitle>
                <CardDescription className="text-sm">
                  Quick scanning with QR codes for instant verification
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3: Photo Recognition */}
            <Card className="bg-background hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-green-600 w-14 h-14 rounded-xl flex items-center justify-center mb-3">
                  <Camera className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-lg">Photo Recognition</CardTitle>
                <CardDescription className="text-sm">
                  AI-powered image analysis to extract medicine details
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4: Detailed Info */}
            <Card className="bg-background hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-orange-600 w-14 h-14 rounded-xl flex items-center justify-center mb-3">
                  <Info className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-lg">Detailed Info</CardTitle>
                <CardDescription className="text-sm">
                  Complete medicine information with AI-generated insights
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users ensuring medicine safety with MedSafe
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Sign Up Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
