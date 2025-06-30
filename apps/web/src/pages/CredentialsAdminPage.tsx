import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, RotateCcw } from "lucide-react";
import { CredentialTemplate } from "@shared/schema";
import { CredFormDialog } from "@/components/CredFormDialog";
import { useToast } from "@/hooks/use-toast";

export default function CredentialsAdminPage() {
  const [editing, setEditing] = useState<CredentialTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/admin/credentials"],
    retry: false,
  });

  const templatesArray = (templates as CredentialTemplate[]) || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/credentials/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete credential template");
      }
    },
    onSuccess: () => {
      toast({ title: "Credential template deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credentials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cred-lib"] });
    },
    onError: () => {
      toast({ 
        title: "Failed to delete credential template",
        variant: "destructive"
      });
    },
  });

  const healthCheckMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/credentials/health", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Health check failed");
      }
    },
    onSuccess: () => {
      toast({ title: "Credential assets validated and restored" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credentials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cred-lib"] });
    },
    onError: () => {
      toast({ 
        title: "Health check failed",
        variant: "destructive"
      });
    },
  });

  const handleDelete = async (id: number, label: string) => {
    if (window.confirm(`Are you sure you want to delete "${label}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSaved = () => {
    setEditing(null);
    setShowCreateDialog(false);
    queryClient.invalidateQueries({ queryKey: ["/api/admin/credentials"] });
    queryClient.invalidateQueries({ queryKey: ["/api/cred-lib"] });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading credential templates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Credential Template Management</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => healthCheckMutation.mutate()}
                disabled={healthCheckMutation.isPending}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Health Check
              </Button>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Issuer</th>
                  <th className="py-2 font-medium">Version</th>
                  <th className="py-2 font-medium">Ecosystem</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {templatesArray.map((template: CredentialTemplate) => (
                  <tr key={template.id} className="border-b hover:bg-muted/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{template.label}</span>
                        {template.isPredefined && (
                          <Badge variant="secondary" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {template.metaOverlay?.issuer || '—'}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {template.version || '—'}
                    </td>
                    <td className="py-3">
                      {template.ecosystem && (
                        <Badge variant="outline" className="text-xs">
                          {template.ecosystem}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(template)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!template.isPredefined && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(template.id, template.label)}
                            disabled={deleteMutation.isPending}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {templatesArray.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No credential templates found.</p>
              <p className="text-sm mt-1">Create your first template to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {editing && (
        <CredFormDialog
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {showCreateDialog && (
        <CredFormDialog
          initial={{}}
          onClose={() => setShowCreateDialog(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}