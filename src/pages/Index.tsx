import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, Scan, FileText, Users, Bell, Database, Camera, Heart, CheckCircle, Phone, Mail, MapPin } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";
import logo from "@/assets/medsafe-logo.jpg";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="MedSafe Logo" className="h-10 w-10 rounded-lg" />
              <span className="text-2xl font-bold text-primary">MedSafe</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection("home")} className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection("features")} className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-sm font-medium hover:text-primary transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection("benefits")} className="text-sm font-medium hover:text-primary transition-colors">
                Benefits
              </button>
              <button onClick={() => scrollToSection("contact")} className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </button>
              <Button onClick={() => navigate("/auth")}>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-6xl md:text-7xl font-bold text-foreground">
              MedSafe
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground font-medium">
              Your Digital Guardian Against Counterfeit Medicines
            </p>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced AI-powered drug verification system protecting patients from fake pharmaceuticals with real-time authentication and comprehensive safety scoring.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6">
                Start Verification
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection("features")} className="text-lg px-8 py-6">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Comprehensive Drug Safety Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              MedSafe combines cutting-edge technology with pharmaceutical expertise to provide multi-layered protection against counterfeit drugs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Scan className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Multi-Modal Drug Verification</h3>
              <p className="text-muted-foreground leading-relaxed">
                Verify medicines through QR code scanning, batch number lookup, medicine name search, or real-time photo capture. Our AI-powered system instantly authenticates drugs against the FDA database containing 135,000+ verified pharmaceuticals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Image Recognition</h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced computer vision technology analyzes medicine photos in real-time, identifying pills, tablets, and packaging. Powered by Google Gemini AI to provide instant medicine information including composition, dosage, and safety warnings.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Safety Score Calculation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Intelligent algorithm evaluates drug safety based on patient age, medical conditions, current medications, and drug interactions. Provides personalized risk assessment with detailed recommendations for safe usage.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Pharmacist Verification Workflow</h3>
              <p className="text-muted-foreground leading-relaxed">
                Professional pharmacist review layer ensures double-verification of drug authenticity. Licensed pharmacists approve or flag suspicious scans, adding human expertise to automated verification for enhanced patient safety.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Patient Medical History</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive medication tracking system maintains detailed patient history including dosages, start dates, and medical notes. Enables healthcare providers to make informed decisions and identify potential drug interactions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-Time Alert System</h3>
              <p className="text-muted-foreground leading-relaxed">
                Instant notifications for counterfeit drug detection, duplicate scans, and verification requests. Real-time alerts ensure immediate response to potential safety threats, protecting patients from harmful substances.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Database className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">FDA Drug Database Integration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Direct integration with United States FDA database (February 2024 version) containing authentic drug information for 135,000+ pharmaceuticals. Regularly updated to ensure accuracy and include newly approved medications.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Health Assistant</h3>
              <p className="text-muted-foreground leading-relaxed">
                Intelligent chatbot provides instant answers about medicines, side effects, interactions, and proper usage. Available 24/7 to guide patients through the verification process and answer healthcare questions.
              </p>
            </div>

            {/* Feature 9 */}
            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Role-Based Access Control</h3>
              <p className="text-muted-foreground leading-relaxed">
                Secure authentication system with three distinct user roles: Patients for drug verification, Pharmacists for professional review, and Admins for system oversight. Each role has tailored permissions and workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How MedSafe Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple 4-step process to verify drug authenticity and ensure patient safety
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-12">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Scan or Upload Medicine</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Choose your preferred verification method: scan QR code on medicine packaging, search by medicine name, or capture real-time photos of pills and tablets. Our system accepts multiple input formats for maximum convenience.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">AI-Powered Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Advanced artificial intelligence instantly analyzes the medicine against our comprehensive FDA database. Computer vision technology identifies pills by appearance, while batch numbers are cross-referenced with authentic pharmaceutical records. The system checks for expired medications, counterfeit markers, and duplicate scans.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Pharmacist Verification</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Licensed pharmacists receive real-time notifications for pending verifications. They review AI findings, apply professional expertise, and either approve or flag the medicine. This dual-layer verification ensures maximum accuracy and adds human judgment to automated analysis.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 items-start">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Safety Score & Recommendations</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Receive detailed verification results including authenticity status, safety score, drug interactions, and personalized recommendations. The system considers your age, medical conditions, and current medications to provide tailored safety advice. All scans are logged in your medical history for future reference.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose MedSafe?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Protecting patients, empowering healthcare providers, and combating pharmaceutical fraud
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-lg border border-border">
              <h3 className="text-2xl font-bold mb-4 text-primary">For Patients</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Instant verification of medicine authenticity before consumption</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Protection against counterfeit and expired medications</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Personalized safety scores based on your health profile</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Comprehensive medication history tracking</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>24/7 AI health assistant for instant guidance</span>
                </li>
              </ul>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border">
              <h3 className="text-2xl font-bold mb-4 text-primary">For Healthcare Providers</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Professional verification workflow for pharmacists</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Real-time alerts for counterfeit drug detection</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Comprehensive admin dashboard for system oversight</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Patient history access for informed decision-making</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Analytics and reporting on counterfeit trends</span>
                </li>
              </ul>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border">
              <h3 className="text-2xl font-bold mb-4 text-primary">For Public Health</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Reduces pharmaceutical fraud and counterfeit circulation</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Prevents adverse drug reactions from fake medicines</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Creates awareness about drug safety and verification</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Collects data on counterfeit patterns for authorities</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Contributes to safer pharmaceutical supply chains</span>
                </li>
              </ul>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border">
              <h3 className="text-2xl font-bold mb-4 text-primary">Technical Excellence</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Cloud-based architecture ensuring 99.9% uptime</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>End-to-end encryption for patient data security</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>HIPAA-compliant data storage and transmission</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Scalable infrastructure handling millions of verifications</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Regular security audits and compliance checks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Built with Cutting-Edge Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Modern tech stack ensuring reliability, security, and scalability
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg border border-border">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Frontend Technologies</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• React.js with TypeScript for type-safe development</li>
                  <li>• TailwindCSS for responsive design system</li>
                  <li>• Shadcn/ui for accessible component library</li>
                  <li>• React Router for seamless navigation</li>
                  <li>• Real-time QR scanning with html5-qrcode</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Backend Infrastructure</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Lovable Cloud for database and authentication</li>
                  <li>• PostgreSQL for reliable data storage</li>
                  <li>• Edge Functions for serverless computing</li>
                  <li>• Row-Level Security (RLS) for data protection</li>
                  <li>• Real-time subscriptions for live updates</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">AI & Machine Learning</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Google Gemini AI for image recognition</li>
                  <li>• Lovable AI for intelligent chatbot</li>
                  <li>• Computer vision for pill identification</li>
                  <li>• Natural language processing for queries</li>
                  <li>• Machine learning for safety scoring</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Security & Compliance</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Multi-factor authentication support</li>
                  <li>• Role-based access control (RBAC)</li>
                  <li>• Encrypted data transmission (SSL/TLS)</li>
                  <li>• HIPAA-compliant architecture</li>
                  <li>• Regular security audits and updates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions? We're here to help you verify drug authenticity and ensure patient safety
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border border-border text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Phone</h3>
                <p className="text-muted-foreground">+91 98765 43210</p>
                <p className="text-muted-foreground text-sm mt-1">Mon-Fri, 9AM-6PM IST</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Email</h3>
                <p className="text-muted-foreground">support@medsafe.in</p>
                <p className="text-muted-foreground text-sm mt-1">24/7 Support</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Address</h3>
                <p className="text-muted-foreground">MedSafe Technologies</p>
                <p className="text-muted-foreground text-sm mt-1">Mumbai, Maharashtra, India</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-12 py-6">
                Start Using MedSafe Today
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="MedSafe Logo" className="h-8 w-8 rounded-lg" />
              <span className="text-lg font-bold text-foreground">MedSafe</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © 2025 MedSafe. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Protecting Patients • Fighting Counterfeit Drugs • Ensuring Safety
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
