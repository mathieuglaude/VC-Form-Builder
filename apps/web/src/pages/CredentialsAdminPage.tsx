import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ExternalLink, Trash2, Edit, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { apiRequest } from "@/lib/queryClient";

interface CredentialTemplate {
  id: number;
  label: string;
  version: string;
  schemaId: string;
  credDefId: string;
  issuerDid: string;
  overlays: any[];
  governanceUrl?: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CredentialsAdminPage() {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [bundleUrl, setBundleUrl] = useState("");
  const [governanceUrl, setGovernanceUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch credential templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/admin/credentials'],
    queryFn: async () => {
      const response = await fetch('/api/admin/credentials');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Import bundle mutation
  const importMutation = useMutation({
    mutationFn: async ({ bundleUrl, governanceUrl }: { bundleUrl: string; governanceUrl?: string }) => {
      const response = await apiRequest('POST', '/api/admin/credentials', {
        bundleUrl,
        governanceUrl: governanceUrl || undefined
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Credential template imported successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/credentials'] });
      setShowImportDialog(false);
      setBundleUrl("");
      setGovernanceUrl("");
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import credential template",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/credentials/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Credential template deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/credentials'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete credential template",
        variant: "destructive"
      });
    }
  });

  const handleImport = async () => {
    if (!bundleUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Bundle URL is required",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    try {
      await importMutation.mutateAsync({
        bundleUrl: bundleUrl.trim(),
        governanceUrl: governanceUrl.trim() || undefined
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = (template: CredentialTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.label}"?`)) {
      deleteMutation.mutate(template.id);
    }
  };

  const getIssuerName = (template: CredentialTemplate) => {
    // Extract issuer name from overlays or use DID
    const metaOverlay = template.overlays?.find(o => o.type === 'oca/overlays/meta/1.0');
    return metaOverlay?.issuer_name || template.issuerDid;
  };

  const getEcosystem = (template: CredentialTemplate) => {
    const metaOverlay = template.overlays?.find(o => o.type === 'oca/overlays/meta/1.0');
    return metaOverlay?.ecosystem || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Credential Templates</h1>
              <p className="text-gray-600 mt-2">
                Manage credential templates and import new ones from OCA bundles
              </p>
            </div>
            <Button onClick={() => setShowImportDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Import Credential
            </Button>
          </div>
        </div>

        <Card className="card">
          <CardHeader>
            <CardTitle>All Credential Templates</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No credential templates found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Ecosystem</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template: CredentialTemplate) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.label}</TableCell>
                      <TableCell className="max-w-48 truncate" title={getIssuerName(template)}>
                        {getIssuerName(template)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.version}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getEcosystem(template)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {template.governanceUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(template.governanceUrl, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(template)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="card p-6 space-y-4">
          <DialogHeader>
            <DialogTitle>Import Credential Template</DialogTitle>
            <DialogDescription>
              Import a new credential template from an OCA bundle URL. You can provide either a direct 
              bundle.json URL or a folder URL containing the bundle.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bundleUrl">Bundle URL *</Label>
              <Input
                id="bundleUrl"
                value={bundleUrl}
                onChange={(e) => setBundleUrl(e.target.value)}
                placeholder="https://github.com/bcgov/aries-oca-bundles/tree/main/OCABundles/schema/..."
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Folder URL or direct bundle.json URL
              </p>
            </div>
            
            <div>
              <Label htmlFor="governanceUrl">Governance Documentation URL</Label>
              <Input
                id="governanceUrl"
                value={governanceUrl}
                onChange={(e) => setGovernanceUrl(e.target.value)}
                placeholder="https://bcgov.github.io/digital-trust-toolkit/..."
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Optional link to governance documentation
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={isImporting || !bundleUrl.trim()}
            >
              {isImporting ? 'Importing...' : 'Import Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}