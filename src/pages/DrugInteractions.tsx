import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, XCircle, Info, Pill, X, Plus, Wine, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Interaction {
  drugs: string[];
  severity: 'SEVERE' | 'MODERATE' | 'MINOR';
  description: string;
  effects: string[];
  recommendations: string[];
}

interface InteractionResult {
  interactions: Interaction[];
  foodInteractions?: Array<{
    drug: string;
    foods: string[];
    recommendation: string;
  }>;
  alcoholInteraction?: {
    severity: string;
    description: string;
    recommendation: string;
  };
  alternatives?: Array<{
    instead_of: string;
    consider: string[];
    reason: string;
  }>;
  overall_safety: 'SAFE' | 'CAUTION' | 'DANGER';
  summary: string;
}

export default function DrugInteractions() {
  const [medications, setMedications] = useState<string[]>(['', '']);
  const [checkFood, setCheckFood] = useState(false);
  const [checkAlcohol, setCheckAlcohol] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InteractionResult | null>(null);
  const { toast } = useToast();

  const addMedication = () => {
    setMedications([...medications, '']);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 2) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, value: string) => {
    const updated = [...medications];
    updated[index] = value;
    setMedications(updated);
  };

  const checkInteractions = async () => {
    const validMeds = medications.filter(m => m.trim() !== '');
    
    if (validMeds.length < 2) {
      toast({
        title: 'Insufficient Information',
        description: 'Please enter at least 2 medications to check interactions',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('drug-interactions', {
        body: {
          medications: validMeds,
          checkFood,
          checkAlcohol,
        },
      });

      if (error) throw error;
      setResult(data);

    } catch (error: any) {
      console.error('Interaction check error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to check drug interactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'SEVERE':
        return 'bg-red-500';
      case 'MODERATE':
        return 'bg-yellow-500';
      case 'MINOR':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'SEVERE':
        return <XCircle className="h-5 w-5" />;
      case 'MODERATE':
        return <AlertTriangle className="h-5 w-5" />;
      case 'MINOR':
        return <Info className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Drug Interaction Checker</h1>
          <p className="text-muted-foreground text-lg">
            Check for potential interactions between multiple medications
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Enter Medications</CardTitle>
              <CardDescription>Add the medications you want to check for interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {medications.map((med, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`med-${index}`} className="sr-only">
                      Medication {index + 1}
                    </Label>
                    <Input
                      id={`med-${index}`}
                      placeholder={`Medication ${index + 1} (e.g., Aspirin, Ibuprofen)`}
                      value={med}
                      onChange={(e) => updateMedication(index, e.target.value)}
                    />
                  </div>
                  {medications.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMedication(index)}
                      aria-label={`Remove medication ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full"
                onClick={addMedication}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Medication
              </Button>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="check-food" className="cursor-pointer">
                      Check food interactions
                    </Label>
                  </div>
                  <Switch
                    id="check-food"
                    checked={checkFood}
                    onCheckedChange={setCheckFood}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wine className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="check-alcohol" className="cursor-pointer">
                      Check alcohol interactions
                    </Label>
                  </div>
                  <Switch
                    id="check-alcohol"
                    checked={checkAlcohol}
                    onCheckedChange={setCheckAlcohol}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={checkInteractions}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Check Interactions'}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Interaction Results</CardTitle>
              <CardDescription>
                {result ? 'Review the analysis below' : 'Results will appear here'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : result ? (
                <div className="space-y-6">
                  {/* Overall Safety */}
                  <Alert className={cn(
                    result.overall_safety === 'SAFE' && 'border-green-500 bg-green-50 dark:bg-green-950',
                    result.overall_safety === 'CAUTION' && 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
                    result.overall_safety === 'DANGER' && 'border-red-500 bg-red-50 dark:bg-red-950'
                  )}>
                    <AlertDescription className="font-medium">
                      {result.summary}
                    </AlertDescription>
                  </Alert>

                  {/* Interactions */}
                  {result.interactions.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Drug Interactions Found
                      </h3>
                      {result.interactions.map((interaction, index) => (
                        <Card key={index} className="border-l-4" style={{ borderLeftColor: `hsl(var(--${interaction.severity.toLowerCase()}))` }}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getSeverityIcon(interaction.severity)}
                                <Badge className={getSeverityColor(interaction.severity)}>
                                  {interaction.severity}
                                </Badge>
                              </div>
                            </div>
                            <CardTitle className="text-base">
                              {interaction.drugs.join(' + ')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm">{interaction.description}</p>
                            
                            {interaction.effects.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">Potential Effects:</p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                  {interaction.effects.map((effect, i) => (
                                    <li key={i}>{effect}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {interaction.recommendations.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">Recommendations:</p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                  {interaction.recommendations.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        No significant drug interactions detected
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Food Interactions */}
                  {result.foodInteractions && result.foodInteractions.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4" />
                        Food Interactions
                      </h3>
                      {result.foodInteractions.map((food, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">{food.drug}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm"><strong>Avoid:</strong> {food.foods.join(', ')}</p>
                            <p className="text-sm">{food.recommendation}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Alcohol Interaction */}
                  {result.alcoholInteraction && result.alcoholInteraction.severity !== 'NONE' && (
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Wine className="h-4 w-4" />
                        Alcohol Interaction
                      </h3>
                      <Card className="border-l-4 border-l-yellow-500">
                        <CardContent className="pt-6 space-y-2">
                          <Badge className={getSeverityColor(result.alcoholInteraction.severity)}>
                            {result.alcoholInteraction.severity}
                          </Badge>
                          <p className="text-sm">{result.alcoholInteraction.description}</p>
                          <p className="text-sm font-medium">{result.alcoholInteraction.recommendation}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Alternatives */}
                  {result.alternatives && result.alternatives.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Safer Alternatives</h3>
                      {result.alternatives.map((alt, index) => (
                        <Card key={index} className="bg-green-50 dark:bg-green-950">
                          <CardContent className="pt-6 space-y-2">
                            <p className="text-sm"><strong>Instead of:</strong> {alt.instead_of}</p>
                            <p className="text-sm"><strong>Consider:</strong> {alt.consider.join(', ')}</p>
                            <p className="text-sm text-muted-foreground">{alt.reason}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Enter medications and click "Check Interactions" to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
