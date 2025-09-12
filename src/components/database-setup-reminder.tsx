import { useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Database, ExternalLink, Copy, CheckCircle } from "lucide-react";

export function DatabaseSetupReminder() {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const sqlScript = `-- Quick fix to add the missing 'completed' column to user_progress table
-- Run this in your Supabase SQL Editor

-- Add completed column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'completed') THEN
        ALTER TABLE public.user_progress ADD COLUMN completed BOOLEAN DEFAULT false;
        
        -- Update existing records where completed_at is not null to set completed = true
        UPDATE public.user_progress 
        SET completed = true 
        WHERE completed_at IS NOT NULL;
        
        -- Add index for better performance
        CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON public.user_progress(completed);
        
        RAISE NOTICE 'Successfully added completed column to user_progress table';
    ELSE
        RAISE NOTICE 'completed column already exists in user_progress table';
    END IF;
END $$;`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (dismissed) return null;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-600" />
          <CardTitle className="text-amber-800">Database Setup Required</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-amber-300 bg-amber-100">
          <AlertDescription className="text-amber-800">
            <strong>Your database needs to be set up!</strong> This will enable progress tracking, XP, and badges.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <h4 className="font-medium text-amber-900">Quick Setup Steps:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800">
            <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Supabase Dashboard <ExternalLink className="w-3 h-3" /></a></li>
            <li>Navigate to <strong>SQL Editor</strong> in the left sidebar</li>
            <li>Copy and paste the SQL script below</li>
            <li>Click <strong>"Run"</strong> to execute the script</li>
            <li>Refresh this page to start tracking progress!</li>
          </ol>
        </div>

        <div className="bg-gray-900 text-green-400 text-xs p-3 rounded-lg font-mono relative">
          <pre className="whitespace-pre-wrap overflow-auto max-h-40">{sqlScript}</pre>
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2 h-7 px-2 bg-gray-800 border-gray-600 text-green-400 hover:bg-gray-700"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => setDismissed(true)}
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            I'll do this later
          </Button>
          <Button 
            size="sm"
            onClick={() => window.location.reload()}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            I ran the script - Refresh page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}