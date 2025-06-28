import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Eye, Settings, Shield, Loader2, Image } from "lucide-react";

export default function HomePage() {
  const [, setLocation] = useLocation();

  // Fetch all forms for listing
  const { data: forms, isLoading } = useQuery({
    queryKey: ['/api/forms']
  });

  const getFormUrl = (form: any) => {
    return `${window.location.origin}/f/${form.slug}`;
  };

  const getVerifiedFieldsCount = (form: any) => {
    const metadata = form.metadata as any;
    if (!metadata?.fields) return 0;
    
    return Object.values(metadata.fields).filter(
      (field: any) => field.type === 'verified'
    ).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-medium text-gray-900">Form Builder Pro</h1>
              <nav className="hidden md:flex space-x-8">
                <span className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">Dashboard</span>
                <span className="text-gray-500 hover:text-gray-700 cursor-pointer">Analytics</span>
                <span className="text-gray-500 hover:text-gray-700 cursor-pointer">Settings</span>
              </nav>
            </div>
            <Button onClick={() => setLocation('/builder/new')} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Form</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Dashboard</h2>
          <p className="text-gray-600">
            Create and manage forms with verifiable credential integration. 
            Build professional forms that auto-populate verified data.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{forms?.length || 0}</h3>
                  <p className="text-sm text-gray-500">Total Forms</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {forms?.filter((f: any) => getVerifiedFieldsCount(f) > 0).length || 0}
                  </h3>
                  <p className="text-sm text-gray-500">VC Enabled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">0</h3>
                  <p className="text-sm text-gray-500">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">0</h3>
                  <p className="text-sm text-gray-500">Submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forms Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Your Forms</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Sort
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Form Card */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-300 cursor-pointer transition-colors" onClick={() => setLocation('/builder/new')}>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <Plus className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Form</h3>
                <p className="text-sm text-gray-500">Start building a new form with VC integration</p>
              </CardContent>
            </Card>

            {/* Existing Forms */}
            {forms?.map((form: any) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Form Header with Logo */}
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg p-4 flex items-center justify-center">
                    {form.logoUrl ? (
                      <img 
                        src={form.logoUrl} 
                        alt={form.name} 
                        className="h-16 w-16 object-contain rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Form Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">
                          {form.name || form.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {form.purpose || form.description || "No description"}
                        </p>
                      </div>
                    </div>

                    {/* Form Stats */}
                    <div className="flex items-center space-x-4 mb-4 text-xs text-gray-500">
                      <span>{form.formSchema?.components?.length || 0} fields</span>
                      <span>•</span>
                      <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                      {getVerifiedFieldsCount(form) > 0 && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Shield className="w-3 h-3 mr-1" />
                            VC Enabled
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setLocation(`/builder/${form.id}`)}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.open(getFormUrl(form), '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </div>

                    {/* Share URL */}
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                      <p className="text-gray-500 mb-1">Share URL:</p>
                      <code className="text-blue-600 break-all">{getFormUrl(form)}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {forms && forms.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
              <p className="text-gray-500 mb-6">Create your first form to get started with VC integration</p>
              <Button onClick={() => setLocation('/builder/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Form
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}