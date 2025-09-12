import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle, Database, User, Zap } from 'lucide-react';

export function DebugInfo() {
  const { user, profile } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const runDatabaseTests = async () => {
    setTesting(true);
    const results: any = {
      connection: false,
      tables: {},
      user: !!user,
      profile: !!profile,
      errors: []
    };

    try {
      // Test basic connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('user_profiles')
        .select('count', { count: 'exact', head: true });

      if (connectionError) {
        results.errors.push(`Connection: ${connectionError.message}`);
      } else {
        results.connection = true;
      }

      // Test each table
      const tables = ['user_profiles', 'learning_modules', 'user_progress', 'emergency_alerts'];
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('count', { count: 'exact', head: true });
          
          if (error) {
            results.tables[table] = { exists: false, error: error.message };
          } else {
            results.tables[table] = { exists: true, count: data?.length || 0 };
          }
        } catch (err) {
          results.tables[table] = { exists: false, error: (err as Error).message };
        }
      }

      // Test user profile access
      if (user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            results.errors.push(`Profile access: ${profileError.message}`);
          } else {
            results.profileData = profileData;
          }
        } catch (err) {
          results.errors.push(`Profile test: ${(err as Error).message}`);
        }
      }

    } catch (error) {
      results.errors.push(`General error: ${(error as Error).message}`);
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Connection Debug
        </CardTitle>
        <CardDescription>
          Test your Supabase connection and table setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDatabaseTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Testing Connection...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Run Database Tests
            </>
          )}
        </Button>

        {testResults && (
          <div className="space-y-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {testResults.connection ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">
                Connection: {testResults.connection ? 'Connected' : 'Failed'}
              </span>
            </div>

            {/* User Status */}
            <div className="flex items-center gap-2">
              {testResults.user ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">
                User: {testResults.user ? 'Authenticated' : 'Not logged in'}
              </span>
              {user && (
                <Badge variant="outline" className="ml-2">
                  {user.id.slice(0, 8)}...
                </Badge>
              )}
            </div>

            {/* Tables Status */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Database Tables:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(testResults.tables).map(([table, status]: [string, any]) => (
                  <div key={table} className="flex items-center gap-2 text-sm">
                    {status.exists ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>{table}</span>
                    {status.exists && (
                      <Badge variant="secondary" className="text-xs">
                        OK
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Data */}
            {testResults.profileData && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <h4 className="font-medium text-sm text-green-800 mb-2">Profile Data Found:</h4>
                <div className="text-xs text-green-700 space-y-1">
                  <div>XP: {testResults.profileData.xp || 0}</div>
                  <div>Level: {testResults.profileData.level || 1}</div>
                  <div>Role: {testResults.profileData.role || 'student'}</div>
                  <div>Badges: {testResults.profileData.badges?.length || 0}</div>
                </div>
              </div>
            )}

            {/* Errors */}
            {testResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h4 className="font-medium text-sm text-red-800 mb-2">Errors:</h4>
                <div className="space-y-1">
                  {testResults.errors.map((error: string, index: number) => (
                    <div key={index} className="text-xs text-red-700 font-mono">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Setup Instructions */}
            {!testResults.connection || Object.values(testResults.tables).some((t: any) => !t.exists) && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <h4 className="font-medium text-sm text-blue-800 mb-2">Setup Required:</h4>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Go to your Supabase dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Copy the content from <code>/database-setup.sql</code></li>
                  <li>Execute the SQL script</li>
                  <li>Run this test again to verify</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}