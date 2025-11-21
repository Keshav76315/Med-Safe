import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle, Scan, Users } from "lucide-react";
import medSafeLogo from "@/assets/medsafe-logo.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/5 via-background to-medical-green/5">
      <div className="container mx-auto px-4 py-16">
        {/* Logo and Title Section */}
        <div className="text-center mb-16">
          <img 
            src={medSafeLogo} 
            alt="MedSafe Logo" 
            className="w-48 h-48 mx-auto mb-6 object-contain"
          />
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Welcome to MedSafe
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Your trusted partner in drug verification and patient safety. 
            Protecting lives through advanced pharmaceutical authentication.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => navigate('/auth')}
          >
            Get Started
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
          <div className="text-center p-6 rounded-lg bg-card border border-border">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Scan className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Drug Verification</h3>
            <p className="text-muted-foreground">
              Scan and verify medications instantly with our advanced QR code and image recognition technology
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card border border-border">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Patient Safety</h3>
            <p className="text-muted-foreground">
              Real-time safety scoring and counterfeit detection to protect patient health and wellbeing
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card border border-border">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Pharmacist Verified</h3>
            <p className="text-muted-foreground">
              Multi-layer verification with professional pharmacist approval for maximum trust
            </p>
          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-5 h-5 text-medical-green" />
            <span>FDA Data Integration</span>
            <span className="mx-2">•</span>
            <CheckCircle className="w-5 h-5 text-medical-green" />
            <span>AI-Powered Detection</span>
            <span className="mx-2">•</span>
            <CheckCircle className="w-5 h-5 text-medical-green" />
            <span>Secure & Private</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
