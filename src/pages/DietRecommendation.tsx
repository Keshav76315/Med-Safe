import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

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

  // Medical history
  const [medicalHistory, setMedicalHistory] = useState<string>("");

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const fetchMedicalHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("patient_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const historyText = data
          .map((record) => 
            `${record.medicine_name} (${record.dosage}) - Started: ${record.start_date}${record.notes ? `, Notes: ${record.notes}` : ""}`
          )
          .join("\n");
        setMedicalHistory(historyText);
      }
    } catch (error) {
      console.error("Error fetching medical history:", error);
    }
  };

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
          medicalHistory,
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

        <div className="space-y-6">
          {/* AI Chat Section - Full Width Top */}
          <Card className="flex flex-col h-[50vh] animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Diet AI Assistant
              </CardTitle>
              <CardDescription>Ask questions about nutrition, meal planning, and dietary advice</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 animate-fade-in">
                    <p>Start a conversation with our AI nutritionist!</p>
                    <p className="text-sm mt-2">Ask about recipes, nutrition facts, meal prep tips, or dietary concerns.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-scale-in`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {message.role === "user" ? (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                  p: ({ children }) => <p className="text-sm mb-1">{children}</p>,
                                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                  ul: ({ children }) => <ul className="list-disc list-inside text-sm mb-1">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal list-inside text-sm mb-1">{children}</ol>,
                                  li: ({ children }) => <li className="text-sm">{children}</li>,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start animate-fade-in">
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
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
                <Button
                  onClick={handleChatSend}
                  disabled={chatLoading || !chatInput.trim()}
                  size="icon"
                  className="hover-scale"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Diet Input Form - Full Width Bottom */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Tell us about your current diet and goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalHistory && (
                <div className="p-4 bg-muted rounded-lg border border-border animate-scale-in">
                  <Label className="text-sm font-semibold mb-2 block">📋 Your Medical History</Label>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{medicalHistory}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="dailyMeals">What do you eat in a day? *</Label>
                <Textarea
                  id="dailyMeals"
                  placeholder="Describe your typical daily meals (breakfast, lunch, dinner, snacks)"
                  value={dailyMeals}
                  onChange={(e) => setDailyMeals(e.target.value)}
                  rows={4}
                  className="transition-all duration-200 focus:scale-[1.01]"
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
                    className="transition-all duration-200 focus:scale-[1.02]"
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
                    className="transition-all duration-200 focus:scale-[1.02]"
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
                    className="transition-all duration-200 focus:scale-[1.02]"
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
                    className="transition-all duration-200 focus:scale-[1.02]"
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
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <Button 
                onClick={handleGetRecommendation} 
                disabled={loading}
                className="w-full hover-scale"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Personalized Recommendation
              </Button>

              {loading && !recommendation ? (
                <Card className="mt-4 bg-muted">
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ) : recommendation ? (
                <Card className="mt-4 bg-muted animate-scale-in">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Personalized Diet Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mt-4 mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg font-semibold text-foreground mt-3 mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-2 mb-1">{children}</h3>,
                          p: ({ children }) => <p className="text-foreground mb-2">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-foreground">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-foreground">{children}</ol>,
                          li: ({ children }) => <li className="text-foreground mb-1">{children}</li>,
                        }}
                      >
                        {recommendation}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
