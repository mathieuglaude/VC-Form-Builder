import { useAllSubmissions } from "@/hooks/useAllSubmissions";
import { useFormSubmissionsPaginated } from "@/hooks/useFormSubmissions";
import { useLocation, Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar, User, FileText, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";

interface SubmissionCardProps {
  submission: any;
  showFormName?: boolean;
}

function SubmissionCard({ submission, showFormName }: SubmissionCardProps) {
  const formattedDate = new Date(submission.createdAt).toLocaleDateString();
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            <Link href={`/submissions/${submission.id}`} className="hover:underline">
              Submission #{submission.id}
            </Link>
          </CardTitle>
          <Badge variant="secondary">
            <Calendar className="w-3 h-3 mr-1" />
            {formattedDate}
          </Badge>
        </div>
        {showFormName && submission.form && (
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="w-4 h-4 mr-1" />
            {submission.form.name}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="w-4 h-4 mr-1" />
            Form ID: {submission.formConfigId}
          </div>
          {submission.submissionData && (
            <div className="text-sm">
              <span className="font-medium">Fields submitted:</span> {Object.keys(submission.submissionData).length}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface PaginatedListProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  children: React.ReactNode;
}

function PaginatedList({ page, total, pageSize, onPageChange, children }: PaginatedListProps) {
  const totalPages = Math.ceil(total / pageSize);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {children}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} submissions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPrev}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNext}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function ErrorPanel({ title }: { title: string }) {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <div className="text-center text-destructive">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GlobalSubmissionsPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("limit") ?? 20);
  const raw = searchParams.get("formId");
  const formId = raw && !Number.isNaN(Number(raw)) ? Number(raw) : undefined;

  // Use conditional hook based on whether we're filtering by form
  const globalQuery = useAllSubmissions(page, pageSize);
  const formQuery = useFormSubmissionsPaginated(formId!, page, pageSize);
  
  const query = formId ? formQuery : globalQuery;
  const { data, isLoading, error } = query;

  if (isLoading) return <Loader />;
  if (error) return <ErrorPanel title="Unable to load submissions" />;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    setLocation(`/submissions?${params.toString()}`);
  };

  const clearFilter = () => {
    setLocation("/submissions");
  };

  // Handle different data structures from the two different APIs
  const submissions = formId 
    ? (data as any)?.submissions || []
    : (data as any)?.data || [];
  
  const total = formId 
    ? (data as any)?.submissions?.length || 0
    : (data as any)?.total || 0;
    
  const currentPage = formId 
    ? page
    : (data as any)?.page || page;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {formId ? `Form #${formId} Submissions` : "All Submissions"}
        </h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {total} total
        </Badge>
      </div>

      {/* Filter indicator */}
      {formId && (
        <div className="mb-4">
          <Label className="text-sm text-muted-foreground">Filtered by form</Label>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="flex items-center gap-1">
              #{formId}
              <button
                onClick={clearFilter}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        </div>
      )}

      {submissions.length > 0 && (
        <PaginatedList
          page={currentPage}
          total={total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        >
          {submissions.map((submission) => (
            <SubmissionCard 
              key={submission.id} 
              submission={submission} 
              showFormName={!formId} // Only show form name when not filtering by form
            />
          ))}
        </PaginatedList>
      )}

      {submissions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No submissions found.</p>
        </div>
      )}
    </div>
  );
}