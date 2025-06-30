import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { CredentialTemplate } from "@shared/schema";
import BannerBottomCard from "@/components/BannerBottomCard";

export default function CredentialDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: credential, isLoading, error } = useQuery({
    queryKey: ['/api/cred-lib', id],
    queryFn: async () => {
      const response = await fetch(`/api/cred-lib/${id}`);
      if (!response.ok) throw new Error('Failed to fetch credential');
      return response.json();
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
        {credential.branding?.layout === 'banner-bottom' ? (
          <BannerBottomCard credential={credential} />
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
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" variant="default">
                <Link href="/build">
                  Use in Form Builder
                </Link>
              </Button>
              
              {credential.schemaUrl && (
                <Button asChild className="w-full" variant="outline">
                  <a
                    href={credential.schemaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    View Documentation
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

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
          {credential.isPredefined && (
            <Card>
              <CardHeader>
                <CardTitle>Governance & Trust</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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

                {credential.schemaUrl && (
                  <div className="pt-2">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a
                        href={credential.schemaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Governance Documentation
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}