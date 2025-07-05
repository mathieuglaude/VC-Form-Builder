import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Copy, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useOCABranding } from "@/hooks/useOCABranding";
import { OCACredentialCard } from "@/components/oca/OCACredentialCard";
import { DeleteCredentialDialog } from "@/components/credentials/DeleteCredentialDialog";
import type { CredentialTemplate } from "@shared/schema";

export default function CredentialDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const credentialId = parseInt(id || '0');

  const { data: credential, isLoading, error } = useQuery({
    queryKey: ['/api/cred-lib', id],
    queryFn: async () => {
      const response = await fetch(`/api/cred-lib/${id}`);
      if (!response.ok) throw new Error('Failed to fetch credential');
      return response.json();
    }
  });

  // Fetch OCA branding for the credential
  const { data: ocaBranding, isLoading: isLoadingOCA } = useOCABranding(credentialId);

  // Delete credential mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/cred-lib/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to delete credential');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch credential library queries
      queryClient.invalidateQueries({ queryKey: ['/api/cred-lib'] });
      // Show success message
      toast({
        title: "Credential deleted",
        description: data.message || "The credential has been permanently deleted.",
      });
      // Redirect back to credential library
      setLocation('/credentials');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete credential",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied to clipboard",
        description: `${fieldName} has been copied to your clipboard.`
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Credential Not Found</h1>
          <p className="text-gray-600 mb-6">The credential you're looking for doesn't exist.</p>
          <Link href="/credentials">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Credential Library
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/credentials">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
        </Link>
      </div>

      {/* Professional Credential Card */}
      <div className="mb-8 flex justify-center">
        {ocaBranding ? (
          <OCACredentialCard
            branding={ocaBranding}
            credentialTitle={credential.label}
            issuerName={credential.meta?.issuer || credential.branding?.issuerName}
            size="large"
          />
        ) : isLoadingOCA ? (
          <div className="w-96 h-56 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading credential card...</div>
          </div>
        ) : (
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                {credential.branding?.logoUrl && (
                  <img
                    src={credential.branding.logoUrl}
                    alt={`${credential.label} logo`}
                    className="h-12 w-12 object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div>
                  <CardTitle className="text-xl">{credential.label}</CardTitle>
                  <CardDescription>Version {credential.version}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{credential.label}</h1>
        {credential.metaOverlay?.description && (
          <p className="text-gray-600 mt-2">{credential.metaOverlay.description}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core credential details and metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Credential Name</label>
                  <p className="text-sm text-gray-900 mt-1">{credential.label}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Version</label>
                  <p className="text-sm text-gray-900 mt-1">{credential.version}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Issuer</label>
                <p className="text-sm text-gray-900 mt-1">
                  {credential.metaOverlay?.issuer || credential.issuerDid}
                </p>
                {credential.metaOverlay?.issuerUrl && (
                  <a 
                    href={credential.metaOverlay.issuerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mt-1"
                  >
                    Visit Issuer Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {(credential.ecosystem || credential.interopProfile) && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Technical Classification</label>
                  <div className="flex gap-2 mt-1">
                    {credential.ecosystem && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {credential.ecosystem}
                      </Badge>
                    )}
                    {credential.interopProfile && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {credential.interopProfile}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {credential.isPredefined && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Provider</label>
                  <div className="mt-1">
                    <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                      BC Government - Official Credential
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
              <CardDescription>Blockchain and schema identifiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Schema ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono flex-1">
                    {credential.schemaId}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(credential.schemaId, "Schema ID")}
                    className="h-8 w-8 p-0"
                  >
                    {copiedField === "Schema ID" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Credential Definition ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono flex-1">
                    {credential.credDefId}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(credential.credDefId, "Credential Definition ID")}
                    className="h-8 w-8 p-0"
                  >
                    {copiedField === "Credential Definition ID" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-gray-700">Orbit Schema ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-blue-100 px-2 py-1 rounded font-mono flex-1">
                    {credential.orbitSchemaId || "Not yet imported"}
                  </code>
                  {credential.orbitSchemaId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(credential.orbitSchemaId.toString(), "Orbit Schema ID")}
                      className="h-8 w-8 p-0"
                    >
                      {copiedField === "Orbit Schema ID" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Orbit Credential Definition ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-blue-100 px-2 py-1 rounded font-mono flex-1">
                    {credential.orbitCredDefId || "Not yet imported"}
                  </code>
                  {credential.orbitCredDefId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(credential.orbitCredDefId.toString(), "Orbit Credential Definition ID")}
                      className="h-8 w-8 p-0"
                    >
                      {copiedField === "Orbit Credential Definition ID" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Issuer DID</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono flex-1 break-all">
                    {credential.issuerDid}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(credential.issuerDid, "Issuer DID")}
                    className="h-8 w-8 p-0"
                  >
                    {copiedField === "Issuer DID" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attributes */}
          <Card>
            <CardHeader>
              <CardTitle>Available Attributes</CardTitle>
              <CardDescription>
                All data fields available in this credential type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {credential.attributes.map((attr: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{attr.name}</h4>
                        {attr.description && (
                          <p className="text-sm text-gray-600 mt-1">{attr.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {!credential.isPredefined && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Credential
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Created</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(credential.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(credential.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-700">Attribute Count</label>
                <p className="text-sm text-gray-900 mt-1">
                  {credential.attributes.length} attributes
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Governance Information */}
          <Card>
            <CardHeader>
              <CardTitle>Governance & Trust</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {credential.isPredefined ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Trust Framework</label>
                    <p className="text-sm text-gray-900 mt-1">BC Digital Trust Ecosystem</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Issuer Authority</label>
                    <p className="text-sm text-gray-900 mt-1">Government of British Columbia</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Verification Level</label>
                    <div className="mt-1">
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Government Issued
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Issuer Organization</label>
                    <p className="text-sm text-gray-900 mt-1">{credential.meta?.issuer || credential.issuer || 'Unknown Issuer'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Verification Level</label>
                    <div className="mt-1">
                      <Badge variant="default" className="bg-amber-100 text-amber-800">
                        Imported Credential
                      </Badge>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Governance Documentation</label>
                <div className="mt-1">
                  {credential.governanceUrl && credential.governanceUrl !== "N/A" ? (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a
                        href={credential.governanceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        View Documentation
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-500 py-2">
                      N/A - No governance documentation available
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">OCA Bundle</label>
                <div className="mt-1">
                  {credential.ocaBundleUrl && credential.ocaBundleUrl !== "N/A" ? (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a
                        href={credential.ocaBundleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        View OCA Bundle
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-500 py-2">
                      N/A - No OCA bundle available
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteCredentialDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          deleteMutation.mutate();
          setIsDeleteDialogOpen(false);
        }}
        credentialName={credential?.label || 'this credential'}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}