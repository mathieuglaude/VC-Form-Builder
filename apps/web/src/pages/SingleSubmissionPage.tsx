import React from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { ArrowLeft, Calendar, User, CheckCircle, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSingleSubmission } from '@/hooks/useSingleSubmission';
import { useToast } from '@/hooks/use-toast';

export default function SingleSubmissionPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { 
    data: submission, 
    isLoading, 
    error 
  } = useSingleSubmission(parseInt(submissionId || '0'));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
      });
    });
  };

  const downloadJSON = () => {
    if (!submission) return;
    
    const dataStr = JSON.stringify(submission, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `submission-${submission.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Submission Not Found</h3>
            <p className="text-gray-600 mb-4">The submission you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => setLocation('/')}>Back to Forms</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasVerifiedFields = submission.verifiedFields && Object.keys(submission.verifiedFields).length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation(`/forms/${submission.formConfigId}/submissions`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Submissions
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Submission #{submission.id}
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(submission.createdAt)}
              </div>
              {hasVerifiedFields && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Data
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(JSON.stringify(submission, null, 2), 'Submission data')}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy JSON
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadJSON}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Verified Fields Section */}
        {hasVerifiedFields && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Verified Credential Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(submission.verifiedFields || {}).map(([key, value]) => (
                  <div key={key} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-medium text-green-900 mb-1">{key}</div>
                    <div className="text-green-700 break-words">
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Submission Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Form Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submission.submissionData && Object.keys(submission.submissionData).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(submission.submissionData || {}).map(([key, value]) => (
                  <div key={key} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="font-medium text-gray-900 mb-1">{key}</div>
                    <div className="text-gray-700 break-words">
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No form data submitted</p>
            )}
          </CardContent>
        </Card>

        {/* Raw Data Section */}
        <Card>
          <CardHeader>
            <CardTitle>Raw JSON Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {JSON.stringify(submission, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}