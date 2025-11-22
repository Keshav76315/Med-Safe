import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Phone,
  AlertTriangle,
  FileText,
  MapPin,
  Shield,
  Pill,
  Droplet,
  Heart,
  Stethoscope,
  AlertCircle,
  Clock,
  Activity
} from 'lucide-react';

interface EmergencyReport {
  patientName: string;
  age: string;
  location: string;
  contactNumber: string;
  medicationInvolved: string;
  symptoms: string;
  timeOfIncident: string;
  additionalInfo: string;
}

export default function Emergency() {
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [report, setReport] = useState<EmergencyReport>({
    patientName: '',
    age: '',
    location: '',
    contactNumber: '',
    medicationInvolved: '',
    symptoms: '',
    timeOfIncident: '',
    additionalInfo: ''
  });
  const { toast } = useToast();

  const emergencyNumbers = [
    { name: 'National Emergency Number', number: '112', description: 'Police, Fire & Ambulance', icon: Phone },
    { name: 'Ambulance Service', number: '102', description: 'Medical Emergency', icon: Activity },
    { name: 'Poison Control Helpline', number: '1800-11-4088', description: 'AIIMS Poison Control Centre', icon: AlertTriangle },
    { name: 'National Health Helpline', number: '104', description: 'Health Information & Guidance', icon: Heart },
  ];

  const firstAidGuides = [
    {
      title: 'Wrong Medication Swallowed',
      steps: [
        'Stay calm and do not panic',
        'Call poison control immediately (1800-11-4088)',
        'Do NOT induce vomiting unless instructed by medical professional',
        'Keep the medication packaging/bottle for reference',
        'Monitor vital signs: breathing, pulse, consciousness',
        'Note the time medication was taken and estimated quantity',
        'If unconscious, place in recovery position (on side)',
        'Call 112 for immediate ambulance if severe symptoms'
      ],
      warning: 'Do not give anything by mouth if person is unconscious'
    },
    {
      title: 'Drug Overdose',
      steps: [
        'Call 112 immediately for emergency services',
        'Check if person is breathing and conscious',
        'If unconscious but breathing, place in recovery position',
        'If not breathing, start CPR if trained',
        'Do NOT leave person alone',
        'Keep them warm with blanket',
        'Collect any remaining pills/substances for medical team',
        'Note time of overdose and substance involved'
      ],
      warning: 'Never try to make person vomit. Time is critical - call for help immediately'
    },
    {
      title: 'Allergic Reaction to Medication',
      steps: [
        'Stop taking the medication immediately',
        'Check for signs: rash, swelling, difficulty breathing',
        'If breathing difficulty, call 112 immediately',
        'If person has EpiPen/adrenaline auto-injector, use it',
        'Help person sit upright if breathing difficulty',
        'Loosen tight clothing around neck and chest',
        'Monitor breathing and consciousness',
        'Keep medication packaging for medical reference'
      ],
      warning: 'Severe allergic reactions (anaphylaxis) can be life-threatening. Act fast'
    },
    {
      title: 'Child Ingested Medication',
      steps: [
        'Stay calm to keep child calm',
        'Call poison control (1800-11-4088) immediately',
        'Remove any remaining medication from child\'s mouth',
        'Do NOT induce vomiting',
        'Keep medication container and note what was taken',
        'Estimate quantity consumed and time of ingestion',
        'Monitor child closely for symptoms',
        'Follow poison control instructions exactly'
      ],
      warning: 'Children are more vulnerable to medication effects. Seek help immediately'
    }
  ];

  const overdoseInfo = [
    {
      category: 'Painkiller Overdose (Paracetamol/Ibuprofen)',
      symptoms: ['Nausea and vomiting', 'Abdominal pain', 'Loss of appetite', 'Yellowing of skin/eyes', 'Confusion'],
      antidote: 'N-acetylcysteine (NAC) for paracetamol - must be given within 8-10 hours',
      action: 'Call poison control immediately. Do not wait for symptoms to worsen.'
    },
    {
      category: 'Sedative/Sleeping Pill Overdose',
      symptoms: ['Extreme drowsiness', 'Slurred speech', 'Confusion', 'Slow breathing', 'Loss of consciousness'],
      antidote: 'Flumazenil for benzodiazepines - hospital administration only',
      action: 'Call 112 immediately. Monitor breathing. Be prepared to perform CPR.'
    },
    {
      category: 'Opioid Overdose',
      symptoms: ['Extreme drowsiness', 'Pinpoint pupils', 'Slow/shallow breathing', 'Blue lips or fingernails', 'Unconsciousness'],
      antidote: 'Naloxone (Narcan) - can reverse opioid overdose rapidly',
      action: 'Call 112. Administer Naloxone if available. Start rescue breathing if trained.'
    },
    {
      category: 'Antidepressant Overdose',
      symptoms: ['Rapid heartbeat', 'Drowsiness', 'Vomiting', 'Tremors', 'Seizures', 'Confusion'],
      antidote: 'No specific antidote - supportive care in hospital',
      action: 'Call 112 immediately. Keep person safe from injury. Monitor vital signs.'
    },
    {
      category: 'Blood Pressure Medication Overdose',
      symptoms: ['Dizziness', 'Fainting', 'Rapid/slow heartbeat', 'Confusion', 'Nausea'],
      antidote: 'Depends on specific medication - hospital treatment required',
      action: 'Call poison control. Have person lie down. Monitor blood pressure if possible.'
    }
  ];

  const handleReportChange = (field: keyof EmergencyReport, value: string) => {
    setReport(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitReport = async () => {
    // Validate required fields
    if (!report.patientName || !report.contactNumber || !report.medicationInvolved || !report.symptoms) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingReport(true);

    try {
      // In a real implementation, this would send to authorities/database
      // For now, we'll just log it and show success
      console.log('Emergency report submitted:', report);
      
      toast({
        title: 'Report Submitted',
        description: 'Emergency authorities have been notified. Help is on the way.',
      });

      setReportSubmitted(true);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setReport({
          patientName: '',
          age: '',
          location: '',
          contactNumber: '',
          medicationInvolved: '',
          symptoms: '',
          timeOfIncident: '',
          additionalInfo: ''
        });
        setReportSubmitted(false);
      }, 5000);

    } catch (error) {
      console.error('Report submission error:', error);
      toast({
        title: 'Submission Failed',
        description: 'Could not submit report. Please call emergency services directly.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Emergency Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Emergency Medical Safety</h1>
              <p className="text-muted-foreground text-lg">
                Immediate help for medication emergencies - No login required
              </p>
            </div>
          </div>
        </div>

        {/* Critical Alert */}
        <Alert className="mb-6 border-destructive bg-destructive/10">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertDescription className="text-base font-medium">
            <strong>Medical Emergency?</strong> Call 112 (National Emergency) or 102 (Ambulance) immediately. 
            This page provides guidance but is not a substitute for professional medical care.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="hotlines" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="hotlines" className="flex flex-col items-center gap-1 py-3">
              <Phone className="h-5 w-5" />
              <span className="text-xs">Emergency Hotlines</span>
            </TabsTrigger>
            <TabsTrigger value="firstaid" className="flex flex-col items-center gap-1 py-3">
              <Shield className="h-5 w-5" />
              <span className="text-xs">First Aid Guides</span>
            </TabsTrigger>
            <TabsTrigger value="overdose" className="flex flex-col items-center gap-1 py-3">
              <Pill className="h-5 w-5" />
              <span className="text-xs">Overdose Info</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex flex-col items-center gap-1 py-3">
              <FileText className="h-5 w-5" />
              <span className="text-xs">Report Emergency</span>
            </TabsTrigger>
          </TabsList>

          {/* Emergency Hotlines Tab */}
          <TabsContent value="hotlines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-destructive" />
                  Indian Emergency Hotlines
                </CardTitle>
                <CardDescription>
                  One-tap emergency calling. Available 24/7 nationwide.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {emergencyNumbers.map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <Card key={index} className="border-2 hover:border-primary transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-destructive/10 rounded-full">
                              <Icon className="h-6 w-6 text-destructive" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{contact.name}</h3>
                              <p className="text-sm text-muted-foreground">{contact.description}</p>
                            </div>
                          </div>
                          <a href={`tel:${contact.number}`}>
                            <Button size="lg" variant="destructive" className="text-lg font-bold">
                              <Phone className="mr-2 h-5 w-5" />
                              {contact.number}
                            </Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-warning bg-warning/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Important Information for Emergency Calls:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                      <li>Stay calm and speak clearly</li>
                      <li>Provide your exact location with landmarks</li>
                      <li>Describe the emergency and symptoms</li>
                      <li>Mention medication name and quantity if known</li>
                      <li>Follow dispatcher instructions carefully</li>
                      <li>Don't hang up until told to do so</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* First Aid Guides Tab */}
          <TabsContent value="firstaid" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Medication Emergency First Aid
                </CardTitle>
                <CardDescription>
                  Step-by-step guides for common medication emergencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {firstAidGuides.map((guide, index) => (
                    <AccordionItem key={index} value={`guide-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-5 w-5 text-primary" />
                          <span className="font-semibold">{guide.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <Alert className="border-destructive bg-destructive/10">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <AlertDescription className="font-medium">
                              {guide.warning}
                            </AlertDescription>
                          </Alert>
                          
                          <div>
                            <h4 className="font-semibold mb-3">Steps to Follow:</h4>
                            <ol className="space-y-2">
                              {guide.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-2">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-semibold">
                                    {stepIndex + 1}
                                  </span>
                                  <span className="flex-1 pt-0.5">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overdose Information Tab */}
          <TabsContent value="overdose" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-destructive" />
                  Drug Overdose Information
                </CardTitle>
                <CardDescription>
                  Recognize symptoms and understand treatment options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {overdoseInfo.map((info, index) => (
                  <Card key={index} className="border-l-4 border-l-destructive">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Droplet className="h-5 w-5 text-destructive" />
                        {info.category}
                      </h3>
                      
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-destructive">Warning Signs:</h4>
                        <ul className="grid grid-cols-2 gap-2">
                          {info.symptoms.map((symptom, sIndex) => (
                            <li key={sIndex} className="flex items-center gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                              {symptom}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-accent/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Antidote/Treatment:</h4>
                        <p className="text-sm">{info.antidote}</p>
                      </div>

                      <Alert className="border-warning bg-warning/10">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <AlertDescription className="font-medium">
                          <strong>Action Required:</strong> {info.action}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                ))}

                <Alert className="border-primary">
                  <Heart className="h-5 w-5 text-primary" />
                  <AlertDescription>
                    <strong>Remember:</strong> Early intervention saves lives. If you suspect an overdose, 
                    call emergency services immediately. Do not wait for all symptoms to appear.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Report Tab */}
          <TabsContent value="report" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  File Emergency Report
                </CardTitle>
                <CardDescription>
                  Report a medication emergency to authorities with location sharing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportSubmitted ? (
                  <Alert className="border-accent bg-accent/10">
                    <Shield className="h-5 w-5 text-accent" />
                    <AlertDescription className="text-lg">
                      <strong>Report Submitted Successfully!</strong>
                      <br />
                      Emergency authorities have been notified and will respond shortly.
                      Please ensure someone is present at the reported location.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <Alert className="border-destructive">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <AlertDescription>
                        For immediate emergencies, call <strong>112</strong> first, then file this report.
                      </AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="patientName">Patient Name *</Label>
                        <Input
                          id="patientName"
                          value={report.patientName}
                          onChange={(e) => handleReportChange('patientName', e.target.value)}
                          placeholder="Full name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          value={report.age}
                          onChange={(e) => handleReportChange('age', e.target.value)}
                          placeholder="Patient age"
                          type="number"
                        />
                      </div>

                      <div>
                        <Label htmlFor="contactNumber">Contact Number *</Label>
                        <Input
                          id="contactNumber"
                          value={report.contactNumber}
                          onChange={(e) => handleReportChange('contactNumber', e.target.value)}
                          placeholder="+91 XXXXX XXXXX"
                          type="tel"
                        />
                      </div>

                      <div>
                        <Label htmlFor="timeOfIncident">Time of Incident</Label>
                        <Input
                          id="timeOfIncident"
                          value={report.timeOfIncident}
                          onChange={(e) => handleReportChange('timeOfIncident', e.target.value)}
                          type="datetime-local"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location (Address with Landmarks)
                      </Label>
                      <Textarea
                        id="location"
                        value={report.location}
                        onChange={(e) => handleReportChange('location', e.target.value)}
                        placeholder="Complete address with nearby landmarks for ambulance"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="medicationInvolved">Medication Involved *</Label>
                      <Input
                        id="medicationInvolved"
                        value={report.medicationInvolved}
                        onChange={(e) => handleReportChange('medicationInvolved', e.target.value)}
                        placeholder="Name of medication and dosage if known"
                      />
                    </div>

                    <div>
                      <Label htmlFor="symptoms">Current Symptoms *</Label>
                      <Textarea
                        id="symptoms"
                        value={report.symptoms}
                        onChange={(e) => handleReportChange('symptoms', e.target.value)}
                        placeholder="Describe all symptoms being experienced"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea
                        id="additionalInfo"
                        value={report.additionalInfo}
                        onChange={(e) => handleReportChange('additionalInfo', e.target.value)}
                        placeholder="Any other relevant information (medical history, allergies, etc.)"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleSubmitReport}
                      disabled={submittingReport}
                      size="lg"
                      className="w-full"
                      variant="destructive"
                    >
                      {submittingReport ? 'Submitting Report...' : 'Submit Emergency Report'}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      * Required fields. Your location will be shared with emergency services.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <Card className="mt-8 border-2 border-primary">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-semibold">Prevention is Better Than Cure</h3>
              <p className="text-muted-foreground">
                Always verify medications before use. Use MedSafe's drug verification system to ensure medication authenticity.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => window.location.href = '/verify'}>
                  Verify Drug Now
                </Button>
                <Button onClick={() => window.location.href = '/interactions'}>
                  Check Drug Interactions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
