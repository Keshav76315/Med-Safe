import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, Utensils } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function DietRecommendation() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Diet form state
  const [dailyMeals, setDailyMeals] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [duration, setDuration] = useState("");
  const [goal, setGoal] = useState("");
  const [recommendation, setRecommendation] = useState("");

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");

  const handleGetRecommendation = async () => {
    if (!dailyMeals || !currentWeight || !height || !goal) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("diet-recommendation", {
        body: {
          dailyMeals,
          currentWeight,
          height,
          targetWeight,
          duration,
          goal,
        },
      });

      if (error) throw error;

      setRecommendation(data.recommendation);
      toast({
        title: "Recommendation Generated",
        description: "Your personalized diet plan is ready!",
      });
    } catch (error) {
      console.error("Error getting recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to generate recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = { role: "user", content: chatInput };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("diet-chat", {
        body: {
          messages: [...messages, userMessage],
        },
      });

      if (error) throw error;

      const assistantMessage: Message = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error in chat:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Utensils className="h-8 w-8 text-primary" />
            Diet Recommendation
          </h1>
          <p className="text-muted-foreground">Get personalized diet plans based on your goals and current lifestyle</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Diet Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Tell us about your current diet and goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dailyMeals">What do you eat in a day? *</Label>
                <Textarea
                  id="dailyMeals"
                  placeholder="Describe your typical daily meals (breakfast, lunch, dinner, snacks)"
                  value={dailyMeals}
                  onChange={(e) => setDailyMeals(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentWeight">Current Weight (kg) *</Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    placeholder="70"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    placeholder="65"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="12"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Your Goals *</Label>
                <Textarea
                  id="goal"
                  placeholder="Describe your health goals (e.g., lose weight, gain muscle, improve energy)"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleGetRecommendation} 
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Personalized Recommendation
              </Button>

              {recommendation && (
                <Card className="mt-4 bg-muted">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Personalized Diet Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm">{recommendation}</div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Right Column - AI Chat */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Diet AI Assistant</CardTitle>
              <CardDescription>Ask questions about nutrition, meal planning, and dietary advice</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4 mb-4 h-[500px]">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Start a conversation with our AI nutritionist!</p>
                    <p className="text-sm mt-2">Ask about recipes, nutrition facts, meal prep tips, or dietary concerns.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Ask about diet and nutrition..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !chatLoading && handleChatSend()}
                  disabled={chatLoading}
                />
                <Button
                  onClick={handleChatSend}
                  disabled={chatLoading || !chatInput.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
