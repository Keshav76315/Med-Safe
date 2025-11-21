import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Scan, Users, Brain, Heart, Bell, Database, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/medsafe-logo.jpg";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Apple-style Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50" : "bg-transparent"
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="MedSafe" className="h-8 w-8 rounded-lg" />
              <span className="text-xl font-semibold">MedSafe</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <button 
                onClick={() => scrollToSection("features")}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection("how-it-works")}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                How it works
              </button>
              <button 
                onClick={() => scrollToSection("benefits")}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Benefits
              </button>
            </div>

            <Button 
              onClick={() => navigate("/auth")}
              className="rounded-full px-6"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Apple-style Hero Section */}
      <section 
        id="home" 
        className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        
        <div className="container mx-auto px-6 py-32 text-center relative z-10">
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-semibold tracking-tight leading-none">
              Your digital guardian.
            </h1>
            <h2 className="text-6xl md:text-8xl font-semibold tracking-tight leading-none text-primary">
              Against counterfeits.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto pt-6 font-light leading-relaxed">
              Advanced AI verification that ensures every medicine you take is authentic, safe, and life-saving.
            </p>
            <div className="flex gap-6 justify-center pt-8">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="rounded-full px-8 text-base h-12"
              >
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="ghost" 
                onClick={() => scrollToSection("features")}
                className="rounded-full px-8 text-base h-12"
              >
                Learn more
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Image */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl px-6 pb-12">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border">
            <img 
              src={heroBackground} 
              alt="MedSafe Platform" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* Features Section - Apple Style */}
      <section id="features" className="py-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-semibold mb-6 tracking-tight leading-tight">
              Powerful features.
              <br />
              <span className="text-muted-foreground">Effortlessly simple.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="group p-10 rounded-3xl bg-muted/50 hover:bg-muted/80 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Scan className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Multi-Modal Verification</h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                Verify through QR codes, barcodes, or images with instant database cross-referencing.
              </p>
            </div>

            <div className="group p-10 rounded-3xl bg-muted/50 hover:bg-muted/80 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">AI Recognition</h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                99.2% accuracy in detecting counterfeits through advanced vision algorithms.
              </p>
            </div>

            <div className="group p-10 rounded-3xl bg-muted/50 hover:bg-muted/80 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Safety Scoring</h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                Personalized risk assessment based on your medical history and interactions.
              </p>
            </div>

            <div className="group p-10 rounded-3xl bg-muted/50 hover:bg-muted/80 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Pharmacist Verification</h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                Professional review layer for flagged medications before approval.
              </p>
            </div>

            <div className="group p-10 rounded-3xl bg-muted/50 hover:bg-muted/80 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Real-Time Alerts</h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                Instant notifications for counterfeits, recalls, and safety advisories.
              </p>
            </div>

            <div className="group p-10 rounded-3xl bg-muted/50 hover:bg-muted/80 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Database className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">FDA Database</h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                200,000+ approved medications with batch tracking and recall data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified Apple Style */}
      <section id="how-it-works" className="py-32 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-semibold mb-6 tracking-tight">
              How it works.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
              Four simple steps to ensure your medicine is safe.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <div className="relative p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Scan</h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                Capture medicine with your camera or scan QR codes.
              </p>
            </div>

            <div className="relative p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Analyze</h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                AI verifies against our comprehensive database.
              </p>
            </div>

            <div className="relative p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Verify</h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                Pharmacists review flagged medications.
              </p>
            </div>

            <div className="relative p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold">
                4
              </div>
              <h3 className="text-xl font-semibold mb-3">Protect</h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                Get personalized safety scores and alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Clean Apple Style */}
      <section id="benefits" className="py-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-semibold mb-6 tracking-tight">
              Why MedSafe.
            </h2>
          </div>

          <div className="max-w-6xl mx-auto space-y-16">
            {/* Patient Benefits */}
            <div className="text-center max-w-4xl mx-auto space-y-8">
              <h3 className="text-4xl font-semibold">For everyone.</h3>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Medicine confidence</h4>
                      <p className="text-muted-foreground font-light">Verify every medicine before consumption with instant results.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Personalized monitoring</h4>
                      <p className="text-muted-foreground font-light">Track medications with tailored safety alerts.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Instant warnings</h4>
                      <p className="text-muted-foreground font-light">Prevent dangerous medication combinations automatically.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">AI assistance</h4>
                      <p className="text-muted-foreground font-light">Get medication answers anytime, anywhere.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Healthcare Provider Benefits */}
            <div className="text-center max-w-4xl mx-auto space-y-8">
              <h3 className="text-4xl font-semibold">For healthcare providers.</h3>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Streamlined workflow</h4>
                    <p className="text-muted-foreground font-light">Professional verification tools for pharmacist reviews.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Complete records</h4>
                    <p className="text-muted-foreground font-light">Access full medication history for better decisions.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Excellence */}
            <div className="text-center max-w-5xl mx-auto space-y-8 pt-16">
              <h3 className="text-4xl font-semibold">Built with excellence.</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-8 rounded-2xl bg-muted/50">
                  <p className="text-5xl font-semibold mb-2">99.2%</p>
                  <p className="text-muted-foreground font-light">AI accuracy rate</p>
                </div>
                <div className="p-8 rounded-2xl bg-muted/50">
                  <p className="text-5xl font-semibold mb-2">&lt;2s</p>
                  <p className="text-muted-foreground font-light">Processing time</p>
                </div>
                <div className="p-8 rounded-2xl bg-muted/50">
                  <p className="text-5xl font-semibold mb-2">200K+</p>
                  <p className="text-muted-foreground font-light">FDA medications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Apple Style */}
      <section className="py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-5xl md:text-7xl font-semibold tracking-tight leading-tight">
              Ready to protect
              <br />
              your health?
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-light">
              Join thousands already using MedSafe.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="rounded-full px-10 text-base h-14 mt-8"
            >
              Get started today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer id="contact" className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12 mb-12">
              <div className="text-center md:text-left">
                <h3 className="font-semibold mb-3">Contact</h3>
                <p className="text-muted-foreground text-sm">+91 98765 43210</p>
                <p className="text-muted-foreground text-sm">support@medsafe.in</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-3">Location</h3>
                <p className="text-muted-foreground text-sm">Mumbai, Maharashtra</p>
                <p className="text-muted-foreground text-sm">India</p>
              </div>
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end gap-3 mb-3">
                  <img src={logo} alt="MedSafe" className="h-6 w-6 rounded-lg" />
                  <span className="font-semibold">MedSafe</span>
                </div>
                <p className="text-muted-foreground text-sm">Protecting health through technology</p>
              </div>
            </div>
            <div className="pt-8 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">© 2024 MedSafe. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
