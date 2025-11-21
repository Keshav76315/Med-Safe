import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FDAImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [urls, setUrls] = useState({
    applicationsUrl: '',
    productsUrl: '',
    marketingStatusUrl: ''
  });

  const handleImport = async () => {
    if (!urls.applicationsUrl || !urls.productsUrl || !urls.marketingStatusUrl) {
      toast.error("Please provide all three file URLs");
      return;
    }

    setIsImporting(true);
    try {
      toast.info("Fetching FDA dataset files from URLs...");

      const body = {
        applicationsUrl: urls.applicationsUrl,
        productsUrl: urls.productsUrl,
        marketingStatusUrl: urls.marketingStatusUrl
      };

      toast.info("Processing and importing drugs... This may take 5-10 minutes.");

      const { data, error } = await supabase.functions.invoke('import-fda-drugs', {
        body
      });

      if (error) throw error;

      toast.success(data.message || "Import completed successfully!", {
        description: `Imported ${data.imported} FDA-approved drugs`
      });

      // Clear URLs after successful import
      setUrls({
        applicationsUrl: '',
        productsUrl: '',
        marketingStatusUrl: ''
      });
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error("Import failed", {
        description: error.message || "An error occurred during import"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">FDA Drug Data Import</h1>
          <p className="text-muted-foreground">
            Import FDA-approved drug data into MediSafe database
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Import FDA Dataset from URLs
            </CardTitle>
            <CardDescription>
              Provide direct download URLs to the three FDA dataset text files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Applications.txt URL</label>
                <input
                  type="url"
                  value={urls.applicationsUrl}
                  onChange={(e) => setUrls(prev => ({ ...prev, applicationsUrl: e.target.value }))}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Products.txt URL</label>
                <input
                  type="url"
                  value={urls.productsUrl}
                  onChange={(e) => setUrls(prev => ({ ...prev, productsUrl: e.target.value }))}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">MarketingStatus.txt URL</label>
                <input
                  type="url"
                  value={urls.marketingStatusUrl}
                  onChange={(e) => setUrls(prev => ({ ...prev, marketingStatusUrl: e.target.value }))}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Import Details:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Imports up to 10,000 FDA-approved drugs</li>
                <li>Only includes Prescription and OTC drugs (excludes discontinued)</li>
                <li>Automatically generates unique batch numbers</li>
                <li>Classifies risk levels based on drug form and strength</li>
                <li>Sets manufacturing date to 1 year ago, expiry to 2 years from now</li>
              </ul>
            </div>

            <Button 
              onClick={handleImport} 
              disabled={isImporting || !urls.applicationsUrl || !urls.productsUrl || !urls.marketingStatusUrl}
              className="w-full"
              size="lg"
            >
              {isImporting ? (
                <>Processing...</>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Import FDA Data from URLs
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1: Extract the FDA Dataset ZIP</strong></p>
            <p>Extract your downloaded ZIP file to get the three text files</p>
            
            <p className="pt-3"><strong>Step 2: Upload to Cloud Storage</strong></p>
            <p>1. Upload Applications.txt, Products.txt, and MarketingStatus.txt to Google Drive or Dropbox</p>
            <p>2. For Google Drive: Right-click → Share → Change to "Anyone with the link"</p>
            <p>3. Copy the shareable link for each file</p>
            
            <p className="pt-3"><strong>Step 3: Paste URLs & Import</strong></p>
            <p>Paste each file's URL above and click "Import FDA Data from URLs"</p>
            
            <p className="text-amber-600 dark:text-amber-500 pt-3">
              ⚠️ Important: Files must be publicly accessible (sharing enabled)
            </p>
            <p className="text-amber-600 dark:text-amber-500">
              ⚠️ Import takes 5-10 minutes. Don't close this page during import.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FDAImport;
