import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";

interface PublishFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  form: any;
}

// Simple kebab-case converter (without lodash)
function kebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function PublishFormDialog({ isOpen, onClose, form }: PublishFormDialogProps) {
  const [slug, setSlug] = useState(
    form?.name ? kebabCase(form.name) : ''
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check slug availability
  const { data: slugCheckData } = useQuery({
    queryKey: ['slug-check', slug],
    queryFn: async () => {
      if (!slug) return { available: false };
      const response = await fetch(`/api/forms/${form?.id}/check-slug?slug=${slug}`);
      if (!response.ok) throw new Error('Failed to check slug');
      return response.json();
    },
    enabled: Boolean(slug && form?.id) && isOpen,
    staleTime: 0
  });

  // Publish form mutation
  const publishMutation = useMutation({
    mutationFn: async (slugToPublish: string) => {
      const response = await fetch(`/api/forms/${form.id}/publish-with-slug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slugToPublish })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish form');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      toast({
        title: "Success",
        description: "Form published successfully!"
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handlePublish = () => {
    if (slug && slugCheckData?.available) {
      publishMutation.mutate(slug);
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(kebabCase(value));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish Form</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="slug">Public URL Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="my-form-slug"
              className="mt-1"
              disabled={form?.isPublished}
            />
            
            {slug && (
              <div className="mt-2 text-sm">
                {slugCheckData?.available ? (
                  <p className="text-green-600">✓ URL available</p>
                ) : (
                  <p className="text-red-600">URL taken, try another</p>
                )}
              </div>
            )}
            
            {slug && (
              <p className="mt-1 text-xs text-gray-500">
                Public URL: {window.location.origin}/f/{slug}
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={!slugCheckData?.available || publishMutation.isPending || form?.isPublished}
            >
              {publishMutation.isPending ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
          
          {form?.isPublished && (
            <p className="text-sm text-gray-500">
              This form is already published and cannot be republished.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}