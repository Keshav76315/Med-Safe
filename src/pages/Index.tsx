import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Scan, Users, Brain, Heart, Bell, Database, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/OptimizedImage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import logo from "@/assets/medsafe-logo.jpg";
import heroBackground from "@/assets/hero-background.jpg";

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = "", decimals = 0 }: { 
  end: number; 
  duration?: number; 
  suffix?: string; 
  decimals?: number;
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(end * easeOutQuart);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <div ref={counterRef}>
      <p className="text-5xl md:text-6xl font-semibold mb-2">
        {count.toFixed(decimals)}{suffix}
      </p>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setScrollY(window.scrollY);
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
              <OptimizedImage 
                src={logo} 
                alt="MedSafe Logo" 
                className="h-8 w-8 rounded-lg" 
                priority 
              />
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

      {/* Apple-style Hero Section with Video Background */}
      <section 
        id="home" 
        className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
      >
        {/* Video Background with Parallax */}
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        
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

        {/* Floating Image with Parallax */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl px-6 pb-12"
          style={{
            transform: `translate(-50%, ${scrollY * 0.15}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border">
            <OptimizedImage 
              src={heroBackground} 
              alt="MedSafe Platform Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* Interactive 3D Product Showcase */}
      <section id="features" className="py-32 bg-background relative">
        {/* Background Layer with Parallax */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-muted/20 to-transparent"
          style={{
            transform: `translateY(${(scrollY - 800) * 0.3}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-semibold mb-6 tracking-tight leading-tight">
              Powerful features.
              <br />
              <span className="text-muted-foreground">Effortlessly simple.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto perspective-1000">
            <div className="group p-10 rounded-3xl bg-muted/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-4 hover:scale-105 transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <Scan className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Multi-Modal Verification</h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                Verify through QR codes, barcodes, or images with instant database cross-referencing.
              </p>
            </div>

            <div className="group p-10 rounded-3xl bg-muted/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-4 hover:scale-105 transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">AI Recognition</h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                99.2% accuracy in detecting counterfeits through advanced vision algorithms.
              </p>
            </div>

            <div className="group p-10 rounded-3xl bg-muted/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-4 hover:scale-105 transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Safety Scoring</h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                Personalized risk assessment based on your medical history and interactions.
              </p>
            </div>

            <div className="group p-10 rounded-3xl bg-muted/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-4 hover:scale-105 transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Pharmacist Verification</h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                Professional review layer for flagged medications before approval.
              </p>
            </div>

            <div className="group p-10 rounded-3xl bg-muted/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-4 hover:scale-105 transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Real-Time Alerts</h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                Instant notifications for counterfeits, recalls, and safety advisories.
              </p>
            </div>

            <div className="group p-10 rounded-3xl bg-muted/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-4 hover:scale-105 transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
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
      <section id="how-it-works" className="py-32 bg-muted/30 relative overflow-hidden">
        {/* Background Parallax Layer */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
          style={{
            transform: `translateY(${(scrollY - 1500) * 0.25}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        />
        <div className="container mx-auto px-6 relative z-10">
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
      <section id="benefits" className="py-32 bg-background relative overflow-hidden">
        {/* Background Parallax Layer */}
        <div 
          className="absolute inset-0 bg-gradient-to-tl from-muted/30 to-transparent"
          style={{
            transform: `translateY(${(scrollY - 2200) * 0.2}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        />
        <div className="container mx-auto px-6 relative z-10">
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

            {/* Animated Statistics Counter */}
            <div className="text-center max-w-5xl mx-auto space-y-8 pt-16">
              <h3 className="text-4xl font-semibold">Built with excellence.</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-8 rounded-2xl bg-muted/50 hover:bg-muted/70 transition-all duration-300">
                  <AnimatedCounter end={99.2} decimals={1} suffix="%" />
                  <p className="text-muted-foreground font-light">AI accuracy rate</p>
                </div>
                <div className="p-8 rounded-2xl bg-muted/50 hover:bg-muted/70 transition-all duration-300">
                  <AnimatedCounter end={2} decimals={0} suffix="s" />
                  <p className="text-muted-foreground font-light">Average processing time</p>
                </div>
                <div className="p-8 rounded-2xl bg-muted/50 hover:bg-muted/70 transition-all duration-300">
                  <AnimatedCounter end={200} decimals={0} suffix="K+" />
                  <p className="text-muted-foreground font-light">FDA medications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Interactive Accordion */}
      <section className="py-32 bg-muted/20 relative overflow-hidden">
        {/* Background Parallax Layer */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-muted/30"
          style={{
            transform: `translateY(${(scrollY - 3000) * 0.15}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-semibold mb-6 tracking-tight">
              Frequently asked questions.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
              Everything you need to know about MedSafe.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 px-8 overflow-hidden">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                  How does MedSafe verify if a medicine is authentic?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                  MedSafe uses a multi-layered verification system. You can scan QR codes, barcodes, or take photos of medicines. Our AI instantly cross-references the information with our comprehensive FDA database of over 200,000 medications. The system checks batch numbers, expiration dates, and packaging details with 99.2% accuracy to detect counterfeits.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 px-8 overflow-hidden">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                  What is the Safety Score and how is it calculated?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                  The Safety Score is a personalized risk assessment based on your medical history, current medications, allergies, and age. Our AI analyzes potential drug interactions, contraindications, and risk factors specific to your profile. The score updates in real-time as you add new medications, helping you make informed decisions about your health.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 px-8 overflow-hidden">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                  How fast does the verification process take?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                  Most verifications complete in under 2 seconds. Simply scan the QR code or take a photo, and our AI instantly analyzes the medicine. If the system flags any concerns, a licensed pharmacist will review it within minutes to ensure accuracy before providing the final verification result.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 px-8 overflow-hidden">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                  What happens if MedSafe detects a counterfeit medicine?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                  You'll receive an immediate alert with detailed information about why the medicine was flagged. The system will notify relevant healthcare authorities and provide guidance on safe disposal. We also track counterfeit patterns to help protect other users and contribute to broader pharmaceutical safety initiatives.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 px-8 overflow-hidden">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                  Is my medical information secure and private?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                  Absolutely. MedSafe uses bank-level encryption to protect all your data. Your medical history, scan records, and personal information are stored securely and never shared with third parties without your explicit consent. We comply with all healthcare privacy regulations and industry best practices for data protection.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 px-8 overflow-hidden">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                  Can I use MedSafe for over-the-counter medications?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                  Yes! MedSafe works with both prescription and over-the-counter (OTC) medications. Our database includes all FDA-approved drugs, supplements, and common OTC medicines. The verification process and safety scoring work the same way regardless of whether a prescription is required.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 px-8 overflow-hidden">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                  Do I need an internet connection to use MedSafe?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                  An internet connection is required for real-time verification and database lookups. However, your previously scanned medications and medical history are cached locally on your device, so you can view your medication list and safety scores offline. Full verification features require connectivity.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
                  <span className="font-semibold">MedSafe</span>
                </div>
                <p className="text-muted-foreground text-sm">Protecting health through technology</p>
              </div>
            </div>
            <div className="pt-8 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">© 2025 MedSafe. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
