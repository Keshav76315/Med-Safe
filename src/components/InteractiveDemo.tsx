import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

interface DemoStep {
  title: string;
  description: string;
  path?: string;
  highlight?: string;
}

const demoSteps: DemoStep[] = [
  {
    title: "Welcome to MedSafe! 🎉",
    description: "Let's take a quick tour of the platform. MedSafe helps you verify medicine authenticity, track your medical history, and ensure drug safety.",
  },
  {
    title: "Dashboard Overview",
    description: "Your dashboard shows key metrics: total scans, verified drugs, safety alerts, and your personal safety score. All your important information at a glance.",
    path: "/dashboard"
  },
  {
    title: "Drug Verification",
    description: "Scan QR codes, search by medicine name, or upload photos to verify drug authenticity. Our AI-powered system checks against FDA databases.",
    path: "/verify"
  },
  {
    title: "Medical History",
    description: "Track all your medications, dosages, and treatment history in one secure place. Easy to review and share with healthcare providers.",
    path: "/history"
  },
  {
    title: "Safety Score",
    description: "Monitor your personalized safety score based on drug interactions, medical conditions, and risk factors. Stay informed about potential health risks.",
    path: "/safety"
  },
  {
    title: "You're All Set! 🚀",
    description: "Start by verifying your first medicine or exploring the dashboard. If you need help, our AI assistant is here for you!",
    path: "/dashboard"
  }
];

interface InteractiveDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveDemo = ({ isOpen, onClose }: InteractiveDemoProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && demoSteps[currentStep].path) {
      navigate(demoSteps[currentStep].path!);
    }
  }, [currentStep, isOpen, navigate]);

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const currentStepData = demoSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {currentStepData.title}
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-muted-foreground">{currentStepData.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {demoSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {demoSteps.length}
            </span>
          </div>
          
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <Button onClick={handleNext}>
              {currentStep === demoSteps.length - 1 ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
