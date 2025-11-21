import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Database, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FDAImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [files, setFiles] = useState<{
    applications?: File;
    products?: File;
    marketingStatus?: File;
  }>({});

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFileChange = (type: 'applications' | 'products' | 'marketingStatus', file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleImport = async () => {
    if (!files.applications || !files.products || !files.marketingStatus) {
      toast.error("Please upload all three required files");
      return;
    }

    setIsImporting(true);
    try {
      toast.info("Reading FDA dataset files...");
      
      const [applicationsData, productsData, marketingStatusData] = await Promise.all([
        readFileAsText(files.applications),
        readFileAsText(files.products),
        readFileAsText(files.marketingStatus)
      ]);

      toast.info("Processing and importing drugs... This may take a few minutes.");

      const { data, error } = await supabase.functions.invoke('import-fda-drugs', {
        body: { applicationsData, productsData, marketingStatusData }
      });

      if (error) throw error;

      toast.success(data.message || "Import completed successfully!", {
        description: `Imported ${data.imported} FDA-approved drugs`
      });

      // Clear files after successful import
      setFiles({});
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
              Upload FDA Dataset Files
            </CardTitle>
            <CardDescription>
              Upload the three required FDA dataset files (Applications.txt, Products.txt, MarketingStatus.txt)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Applications.txt
                  {files.applications && <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-500" />}
                </label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => handleFileChange('applications', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Products.txt
                  {files.products && <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-500" />}
                </label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => handleFileChange('products', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  MarketingStatus.txt
                  {files.marketingStatus && <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-500" />}
                </label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => handleFileChange('marketingStatus', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
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
              disabled={isImporting || !files.applications || !files.products || !files.marketingStatus}
              className="w-full"
              size="lg"
            >
              {isImporting ? (
                <>Processing...</>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Import FDA Data
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
            <p>1. Extract the uploaded ZIP file on your computer</p>
            <p>2. Locate the three files: Applications.txt, Products.txt, and MarketingStatus.txt</p>
            <p>3. Upload each file using the file inputs above</p>
            <p>4. Click "Import FDA Data" to start the import process</p>
            <p className="text-amber-600 dark:text-amber-500">
              ⚠️ Note: The import process may take several minutes. Do not close this page until complete.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FDAImport;
