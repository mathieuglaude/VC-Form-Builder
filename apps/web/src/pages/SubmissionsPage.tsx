import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { ArrowLeft, Calendar, User, CheckCircle, XCircle, Eye, MoreHorizontal, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useFormSubmissions, useFormSubmissionsPaginated } from '@/hooks/useFormSubmissions';
import { useQuery } from '@tanstack/react-query';
import { isDevOwner } from '@/utils/isDevOwner';

export default function SubmissionsPage() {
  const { formId } = useParams<{ formId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentCursor, setCurrentCursor] = useState<number | undefined>();
  const pageSize = 20;

  // Get form details
  const { data: form, isLoading: formLoading } = useQuery({
    queryKey: ['/api/forms', formId],
    enabled: !!formId,
  });

  // Parse formId to number, default to 0 if invalid
  const formIdNumber = parseInt(formId || '0');
  
  // Get submissions with pagination
  const { 
    data: submissionsResult, 
    isLoading: submissionsLoading, 
    error: submissionsError 
  } = useFormSubmissionsPaginated(
    formIdNumber, 
    currentCursor ?? 1,
    pageSize
  );

  // Route guard: Check if user is the form owner
  useEffect(() => {
    if (form && !formLoading) {
      // Type assertion for form data structure from API
      const formData = form as any;
      // For now, use demo access logic with dev bypass capability
      const isOwner = formData.authorId === "demo" || formData.id <= 100;
      const devBypass = isDevOwner(formData.authorId);
      
      if (!isOwner && !devBypass) {
        console.warn("[SubmissionsGuard]", {
          formAuthor: formData.authorId,
          formId: formData.id,
          devBypass: devBypass,
        });

        toast({
          title: 'Access Denied',
          description: 'You can only view submissions for forms you own.',
          variant: 'destructive',
        });
        setLocation('/');
        return;
      }
    }
  }, [form, formLoading, toast, setLocation]);

  if (formLoading || submissionsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (submissionsError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Submissions</h3>
            <p className="text-gray-600 mb-4">Unable to load form submissions. Please try again.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle both paginated and simple results
  const submissions = Array.isArray(submissionsResult) 
    ? submissionsResult 
    : submissionsResult?.submissions || [];
  
  const hasMore = Array.isArray(submissionsResult) 
    ? false 
    : submissionsResult?.hasMore || false;
  
  const nextCursor = Array.isArray(submissionsResult) 
    ? undefined 
    : submissionsResult?.nextCursor;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVerificationStatus = (submission: any) => {
    if (submission.verifiedFields && Object.keys(submission.verifiedFields).length > 0) {
      return { verified: true, count: Object.keys(submission.verifiedFields).length };
    }
    return { verified: false, count: 0 };
  };

  const getFormFieldValue = (submission: any, fieldKey: string) => {
    if (submission.verifiedFields && submission.verifiedFields[fieldKey]) {
      return submission.verifiedFields[fieldKey];
    }
    if (submission.submissionData && submission.submissionData[fieldKey]) {
      return submission.submissionData[fieldKey];
    }
    return 'N/A';
  };

  const handleLoadMore = () => {
    if (nextCursor) {
      setCurrentCursor(nextCursor);
    }
  };

  const handleViewSubmission = (submissionId: number) => {
    setLocation(`/submissions/${submissionId}`);
  };

  const handleExportSubmissions = () => {
    // TODO: Implement CSV export functionality
    console.log('Export submissions to CSV');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forms
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Form Submissions
            </h1>
            <p className="text-gray-600">
              {(form as any)?.name || 'Loading...'} • {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportSubmissions}
              disabled={submissions.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            
            <Link href={`/builder/${formId}`}>
              <Button variant="outline">
                Edit Form
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {submissions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
            <p className="text-gray-600 mb-6">
              When people fill out your form, their submissions will appear here.
            </p>
            <div className="flex justify-center gap-4">
              <Link href={`/form/${formId}`}>
                <Button>Preview Form</Button>
              </Link>
              {(form as any)?.isPublished && (form as any)?.publicSlug && (
                <Link href={`/f/${(form as any).publicSlug}`}>
                  <Button variant="outline">View Public Form</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissions List */}
      {submissions.length > 0 && (
        <div className="space-y-4">
          {submissions.map((submission: any) => {
            const verificationStatus = getVerificationStatus(submission);
            
            return (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-gray-900">
                          Submission #{submission.id}
                        </h3>
                        
                        {verificationStatus.verified ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {verificationStatus.count} field{verificationStatus.count !== 1 ? 's' : ''} verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Manual entry
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(submission.createdAt)}
                        </div>
                        
                        {/* Show preview of key form fields */}
                        {submission.submissionData && Object.keys(submission.submissionData).length > 0 && (
                          <div className="flex items-center gap-4">
                            {Object.entries(submission.submissionData)
                              .slice(0, 2)
                              .map(([key, value]) => (
                                <span key={key} className="text-gray-700">
                                  <span className="font-medium">{key}:</span> {
                                    typeof value === 'string' 
                                      ? value.slice(0, 30) + (value.length > 30 ? '...' : '')
                                      : JSON.stringify(value).slice(0, 30)
                                  }
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSubmission(submission.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewSubmission(submission.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              // TODO: Implement download single submission
                              console.log('Download submission', submission.id);
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download JSON
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center py-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={submissionsLoading}
              >
                {submissionsLoading ? 'Loading...' : `Load More (${pageSize} per page)`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}