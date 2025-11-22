import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sun, Moon, Monitor } from "lucide-react";

export default function Theme() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>System Theme</CardTitle>
            <CardDescription>
              Choose how MedSafe looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={theme} onValueChange={setTheme}>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted transition-colors">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center cursor-pointer flex-1">
                    <Sun className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Light</div>
                      <div className="text-sm text-muted-foreground">
                        Always use light theme
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted transition-colors">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center cursor-pointer flex-1">
                    <Moon className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Dark</div>
                      <div className="text-sm text-muted-foreground">
                        Always use dark theme
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted transition-colors">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="flex items-center cursor-pointer flex-1">
                    <Monitor className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">System</div>
                      <div className="text-sm text-muted-foreground">
                        Use device theme settings
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
