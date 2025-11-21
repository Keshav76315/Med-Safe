import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FDAImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [jsonUrl, setJsonUrl] = useState('');
  const [importMode, setImportMode] = useState<'url' | 'file' | 'builtin'>('builtin');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        toast.error("Please select a JSON file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (importMode === 'url' && !jsonUrl) {
      toast.error("Please provide a JSON file URL");
      return;
    }
    if (importMode === 'file' && !selectedFile) {
      toast.error("Please select a JSON file");
      return;
    }

    setIsImporting(true);
    try {
      let body: any = {};

      if (importMode === 'builtin') {
        toast.info("Loading built-in dataset...");
        const response = await fetch('/datasets/dataset1.json');
        const jsonData = await response.json();
        body = { jsonData };
      } else if (importMode === 'file' && selectedFile) {
        toast.info("Reading file...");
        const text = await selectedFile.text();
        const jsonData = JSON.parse(text);
        body = { jsonData };
      } else if (importMode === 'url') {
        toast.info("Fetching JSON file from URL...");
        body = { jsonUrl };
      }

      toast.info("Processing and importing drugs... This may take 5-10 minutes.");

      const { data, error } = await supabase.functions.invoke('import-fda-drugs', {
        body
      });

      if (error) throw error;

      toast.success(data.message || "Import completed successfully!", {
        description: `Imported ${data.imported} FDA-approved drugs`
      });

      // Clear inputs after successful import
      setJsonUrl('');
      setSelectedFile(null);
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
              Import Drug Data
            </CardTitle>
            <CardDescription>
              Import FDA-approved drug data from multiple sources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Import Source</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={importMode === 'builtin' ? 'default' : 'outline'}
                  onClick={() => setImportMode('builtin')}
                  className="flex-1"
                >
                  Built-in Dataset
                </Button>
                <Button
                  type="button"
                  variant={importMode === 'file' ? 'default' : 'outline'}
                  onClick={() => setImportMode('file')}
                  className="flex-1"
                >
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={importMode === 'url' ? 'default' : 'outline'}
                  onClick={() => setImportMode('url')}
                  className="flex-1"
                >
                  From URL
                </Button>
              </div>
            </div>

            {importMode === 'builtin' && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Using pre-loaded FDA dataset with {'>'}135,000 drug entries
                </p>
              </div>
            )}

            {importMode === 'file' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select JSON File</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            )}

            {importMode === 'url' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">JSON File URL</label>
                <input
                  type="url"
                  value={jsonUrl}
                  onChange={(e) => setJsonUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Provide a Google Drive or direct URL to your JSON file
                </p>
              </div>
            )}

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Import Details:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Imports up to 10,000 drug entries from JSON</li>
                <li>Automatically generates batch numbers if not provided</li>
                <li>Sets default dates (mfg: 1 year ago, exp: 2 years ahead) if missing</li>
                <li>Classifies risk levels based on dosage form</li>
                <li>All drugs marked as 'authentic' by default</li>
              </ul>
            </div>

            <Button 
              onClick={handleImport} 
              disabled={isImporting || (importMode === 'url' && !jsonUrl) || (importMode === 'file' && !selectedFile)}
              className="w-full"
              size="lg"
            >
              {isImporting ? (
                <>Processing...</>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Import Drug Data
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
            <p><strong>Step 1: Prepare Your JSON File</strong></p>
            <p>Your JSON should be an array of drug objects. Example format:</p>
            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`[
  {
    "name": "Aspirin",
    "manufacturer": "Bayer",
    "active_ingredient": "Acetylsalicylic Acid",
    "dosage_form": "Tablet",
    "drug_id": "FDA-001",
    "batch_no": "BATCH-001",
    "risk_level": "low"
  }
]`}
            </pre>
            
            <p className="pt-3"><strong>Step 2: Upload to Google Drive</strong></p>
            <p>1. Upload your JSON file to Google Drive</p>
            <p>2. Right-click → Share → Change to "Anyone with the link"</p>
            <p>3. Copy the shareable link</p>
            
            <p className="pt-3"><strong>Step 3: Paste URL & Import</strong></p>
            <p>Paste the URL above and click "Import Drug Data from JSON"</p>
            
            <p className="text-amber-600 dark:text-amber-500 pt-3">
              ⚠️ File must be publicly accessible
            </p>
            <p className="text-amber-600 dark:text-amber-500">
              ⚠️ Import may take 5-10 minutes. Don't close this page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FDAImport;
