import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, User, Calendar, ExternalLink, Search } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import type { FormConfig } from '@shared/schema';

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const { toast } = useToast();

  const { data: publicForms = [], isLoading } = useQuery<FormConfig[]>({
    queryKey: ['/api/forms/public'],
  });

  const cloneFormMutation = useMutation({
    mutationFn: async (formId: number) => {
      const response = await fetch(`/api/forms/${formId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: 'demo',
          authorName: 'Demo User'
        })
      });
      if (!response.ok) throw new Error('Failed to clone form');
      return response.json();
    },
    onSuccess: (clonedForm) => {
      toast({
        title: 'Form Cloned Successfully',
        description: `"${clonedForm.name}" has been added to your forms.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
    },
    onError: () => {
      toast({
        title: 'Clone Failed',
        description: 'Unable to clone the form. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const filteredForms = publicForms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPurpose = purposeFilter === 'all' || form.purpose === purposeFilter;
    return matchesSearch && matchesPurpose;
  });

  const uniquePurposes = Array.from(new Set(publicForms.map(form => form.purpose)));

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCloneForm = (form: FormConfig) => {
    cloneFormMutation.mutate(form.id);
  };

  const handleViewForm = (form: FormConfig) => {
    window.open(`/f/${form.slug}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading community forms...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Forms</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and clone forms shared by the community. Find templates for common use cases and customize them for your needs.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={purposeFilter} onValueChange={setPurposeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Purposes</SelectItem>
            {uniquePurposes.map(purpose => (
              <SelectItem key={purpose} value={purpose}>
                {purpose}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            {publicForms.length === 0 
              ? "No public forms available yet. Be the first to publish a form!"
              : "No forms match your search criteria."
            }
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <Card key={form.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{form.name}</CardTitle>
                    <Badge variant="secondary" className="mb-2">
                      {form.purpose}
                    </Badge>
                  </div>
                  {form.logoUrl && (
                    <img 
                      src={form.logoUrl} 
                      alt={`${form.name} logo`}
                      className="w-12 h-12 object-contain"
                    />
                  )}
                </div>
                {form.description && (
                  <CardDescription className="line-clamp-3">
                    {form.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="flex-1">
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      {form.authorName}
                      {form.authorOrg && ` • ${form.authorOrg}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Published {formatDate(form.createdAt)}</span>
                  </div>
                  {form.clonedFrom && (
                    <div className="text-xs text-gray-500">
                      Cloned from another form
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewForm(form)}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleCloneForm(form)}
                  disabled={cloneFormMutation.isPending}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {cloneFormMutation.isPending ? 'Cloning...' : 'Clone'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}