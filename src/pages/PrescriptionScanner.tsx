import { useState, useRef } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Upload, FileText, Loader2, User, Stethoscope, Pill, AlertTriangle, Download } from 'lucide-react';
import { MedicineScanner } from '@/components/MedicineScanner';
import { generateVerificationPDF } from '@/lib/pdfUtils';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionData {
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  hospitalClinic?: string;
  prescriptionDate?: string;
  medications: Medication[];
  additionalNotes?: string;
  refills?: string;
}

export default function PrescriptionScanner() {
  const [scanning, setScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processPrescriptionImage = async (imageBase64: string) => {
    setScanning(true);
    setPrescriptionData(null);
    setVerificationResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('prescription-ocr', {
        body: { imageBase64 }
      });

      if (error) throw error;

      if (data.prescriptionData.error) {
        toast({
          title: "Extraction Failed",
          description: data.prescriptionData.error,
          variant: "destructive",
        });
        return;
      }

      setPrescriptionData(data.prescriptionData);
      toast({
        title: "Prescription Extracted",
        description: `Found ${data.prescriptionData.medications.length} medication(s)`,
      });

    } catch (error: any) {
      console.error('Prescription scan error:', error);
      toast({
        title: "Scan Failed",
        description: error.message || "Could not process the prescription",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = async () => {
      const imageBase64 = reader.result as string;
      await processPrescriptionImage(imageBase64);
    };

    reader.onerror = () => {
      toast({
        title: "Upload Failed",
        description: "Could not read the file",
        variant: "destructive",
      });
    };

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = async (imageBase64: string) => {
    setShowCamera(false);
    await processPrescriptionImage(imageBase64);
  };

  const verifyAllMedications = async () => {
    if (!prescriptionData || prescriptionData.medications.length === 0) return;

    setVerifying(true);
    const results = [];

    try {
      // Check for drug interactions
      const medicationNames = prescriptionData.medications.map(m => m.name);
      
      const { data: interactionData, error: interactionError } = await supabase.functions.invoke('drug-interactions', {
        body: {
          medications: medicationNames,
          checkFood: false,
          checkAlcohol: false,
        },
      });

      if (interactionError) throw interactionError;

      results.push({
        type: 'interactions',
        data: interactionData
      });

      setVerificationResults(results);

      toast({
        title: "Verification Complete",
        description: "All medications have been analyzed",
      });

    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Could not verify medications",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const exportToPDF = async () => {
    if (!prescriptionData) return;

    try {
      // Create a custom PDF for prescription data
      toast({
        title: "PDF Export",
        description: "Prescription export feature coming soon",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Could not export prescription",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Prescription Scanner</h1>
          <p className="text-muted-foreground text-lg">
            Scan or upload prescriptions to extract and verify medication details
          </p>
        </div>

        {/* Scan Options */}
        {!prescriptionData && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Prescription</CardTitle>
              <CardDescription>
                Take a photo or upload an image of your prescription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <div className="grid gap-3">
                <Button
                  onClick={() => setShowCamera(true)}
                  size="lg"
                  className="w-full h-16"
                  disabled={scanning}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Take Photo</div>
                    <div className="text-xs opacity-80">Use camera to scan prescription</div>
                  </div>
                </Button>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg"
                  className="w-full h-16"
                  disabled={scanning}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Upload Image</div>
                    <div className="text-xs opacity-80">Choose from gallery or files</div>
                  </div>
                </Button>
              </div>

              {scanning && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-lg">Processing prescription...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Extracted Prescription Data */}
        {prescriptionData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Prescription Details
                  </CardTitle>
                  <Button
                    onClick={() => {
                      setPrescriptionData(null);
                      setVerificationResults([]);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Scan New
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Patient Information */}
                {(prescriptionData.patientName || prescriptionData.patientAge) && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">Patient Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      {prescriptionData.patientName && (
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{prescriptionData.patientName}</p>
                        </div>
                      )}
                      {prescriptionData.patientAge && (
                        <div>
                          <p className="text-sm text-muted-foreground">Age</p>
                          <p className="font-medium">{prescriptionData.patientAge}</p>
                        </div>
                      )}
                      {prescriptionData.patientGender && (
                        <div>
                          <p className="text-sm text-muted-foreground">Gender</p>
                          <p className="font-medium">{prescriptionData.patientGender}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Doctor Information */}
                {(prescriptionData.doctorName || prescriptionData.hospitalClinic) && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">Doctor Information</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 ml-6">
                        {prescriptionData.doctorName && (
                          <div>
                            <p className="text-sm text-muted-foreground">Doctor</p>
                            <p className="font-medium">{prescriptionData.doctorName}</p>
                          </div>
                        )}
                        {prescriptionData.doctorSpecialty && (
                          <div>
                            <p className="text-sm text-muted-foreground">Specialty</p>
                            <p className="font-medium">{prescriptionData.doctorSpecialty}</p>
                          </div>
                        )}
                        {prescriptionData.hospitalClinic && (
                          <div>
                            <p className="text-sm text-muted-foreground">Hospital/Clinic</p>
                            <p className="font-medium">{prescriptionData.hospitalClinic}</p>
                          </div>
                        )}
                        {prescriptionData.prescriptionDate && (
                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-medium">{prescriptionData.prescriptionDate}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Medications */}
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Medications ({prescriptionData.medications.length})</h3>
                  </div>
                  <div className="space-y-4 ml-6">
                    {prescriptionData.medications.map((med, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-lg">{med.name}</h4>
                            <Badge variant="outline">{med.dosage}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Frequency</p>
                              <p className="font-medium">{med.frequency}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-medium">{med.duration}</p>
                            </div>
                          </div>
                          {med.instructions && (
                            <div className="mt-2 text-sm">
                              <p className="text-muted-foreground">Instructions</p>
                              <p className="text-foreground">{med.instructions}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                {prescriptionData.additionalNotes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Additional Notes</h3>
                      <p className="text-sm text-muted-foreground">{prescriptionData.additionalNotes}</p>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={verifyAllMedications}
                    disabled={verifying}
                    className="flex-1"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Verify All Medications
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={exportToPDF}
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Verification Results */}
            {verificationResults.length > 0 && (
              <Card className="border-2 border-warning">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Drug Interaction Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {verificationResults.map((result, index) => {
                    if (result.type === 'interactions' && result.data) {
                      const interactionData = result.data;
                      return (
                        <div key={index} className="space-y-4">
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="font-medium mb-2">Overall Safety: {interactionData.overall_safety}</p>
                            <p className="text-sm text-muted-foreground">{interactionData.summary}</p>
                          </div>

                          {interactionData.interactions && interactionData.interactions.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-semibold">Detected Interactions:</h4>
                              {interactionData.interactions.map((interaction: any, idx: number) => (
                                <Card key={idx} className="border-l-4 border-l-warning">
                                  <CardContent className="pt-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <p className="font-medium">{interaction.drugs.join(' + ')}</p>
                                      <Badge variant="destructive">{interaction.severity}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{interaction.description}</p>
                                    {interaction.recommendations && interaction.recommendations.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-sm font-medium">Recommendations:</p>
                                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                                          {interaction.recommendations.map((rec: string, i: number) => (
                                            <li key={i}>{rec}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}

                          {(!interactionData.interactions || interactionData.interactions.length === 0) && (
                            <div className="bg-accent/10 p-4 rounded-lg text-center">
                              <p className="text-accent font-medium">No significant interactions detected</p>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {showCamera && (
        <MedicineScanner
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
