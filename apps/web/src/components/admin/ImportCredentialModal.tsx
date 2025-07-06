import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ImportCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ImportCredentialData {
  label: string;
  version: string;
  issuerName: string;
  issuerWebsite?: string;
  description?: string;
  issuerDid: string;
  ledgerNetwork: string;
  schemaId: string;
  credDefId: string;
  attributes: string;
  ocaBundleUrl?: string;
  governanceUrl?: string;
  primaryColor: string;
  ecosystem: string;
  interopProfile: string;

}

const LEDGER_NETWORKS = [
  { value: 'SOVRIN_MAIN', label: 'Sovrin MainNet' },
  { value: 'SOVRIN_STAGING', label: 'Sovrin StagingNet' },
  { value: 'BCOVRIN_TEST', label: 'BCovrin Test' },
  { value: 'CANDY_DEV', label: 'CANdy Dev' },
  { value: 'CANDY_TEST', label: 'CANdy Test' },
  { value: 'CANDY_PROD', label: 'CANdy Production' },
];

export default function ImportCredentialModal({ isOpen, onClose }: ImportCredentialModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ImportCredentialData>({
    label: '',
    version: '1.0',
    issuerName: '',
    issuerWebsite: '',
    description: '',
    issuerDid: '',
    ledgerNetwork: 'BCOVRIN_TEST',
    schemaId: '',
    credDefId: '',
    attributes: '',
    ocaBundleUrl: '',
    governanceUrl: '',
    primaryColor: '#4F46E5',
    ecosystem: 'Custom Ecosystem',
    interopProfile: 'AIP 2.0',

  });

  const [errors, setErrors] = useState<Partial<Record<keyof ImportCredentialData, string>>>({});
  const [bundleUrlError, setBundleUrlError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ImportCredentialData, string>> = {};

    if (!formData.label.trim()) newErrors.label = 'Label is required';
    if (!formData.version.trim()) newErrors.version = 'Version is required';
    if (!formData.issuerName.trim()) newErrors.issuerName = 'Issuer name is required';
    if (!formData.issuerDid.trim()) newErrors.issuerDid = 'Issuer DID is required';
    if (!formData.schemaId.trim()) newErrors.schemaId = 'Schema ID is required';
    if (!formData.credDefId.trim()) newErrors.credDefId = 'Credential Definition ID is required';
    if (!formData.attributes.trim()) newErrors.attributes = 'Attributes are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBundleUrl = async (url: string): Promise<boolean> => {
    if (!url.trim()) return true; // Optional field

    try {
      // Check if it's a valid URL
      new URL(url);
      
      // If it looks like a GitHub folder URL, try to construct the bundle.json URL
      let bundleJsonUrl = url;
      if (url.includes('github.com') && !url.endsWith('bundle.json')) {
        bundleJsonUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/tree/', '/') + '/bundle.json';
      }

      const response = await fetch(bundleJsonUrl, { method: 'HEAD' });
      if (!response.ok) {
        setBundleUrlError('Bundle.json not found at this URL');
        return false;
      }

      setBundleUrlError('');
      return true;
    } catch (error) {
      setBundleUrlError('Invalid URL format');
      return false;
    }
  };

  const importMutation = useMutation({
    mutationFn: async (data: ImportCredentialData) => {
      // Validate bundle URL if provided
      if (data.ocaBundleUrl && !(await validateBundleUrl(data.ocaBundleUrl))) {
        throw new Error('Invalid bundle URL');
      }

      const response = await fetch('/api/cred-templates/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          attributes: data.attributes.split(',').map(attr => attr.trim()).filter(Boolean),
          // Ensure all new fields are included
          ecosystem: data.ecosystem || '',
          interopProfile: data.interopProfile || '',
          issuerWebsite: data.issuerWebsite || '',
          description: data.description || '',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import credential');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Credential imported successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cred-lib'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/credentials'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to import credential',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      label: '',
      version: '1.0',
      issuerName: '',
      issuerWebsite: '',
      description: '',
      issuerDid: '',
      ledgerNetwork: 'BCOVRIN_TEST',
      schemaId: '',
      credDefId: '',
      attributes: '',
      ocaBundleUrl: '',
      governanceUrl: '',
      primaryColor: '#4F46E5',
      ecosystem: 'Custom Ecosystem',
      interopProfile: 'AIP 2.0',

    });
    setErrors({});
    setBundleUrlError('');
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    importMutation.mutate(formData);
  };

  const handleChange = (field: keyof ImportCredentialData, value: string | boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Credential Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => handleChange('label', e.target.value)}
                  placeholder="e.g. BC Digital Business Card v1"
                />
                {errors.label && <p className="text-sm text-red-600 mt-1">{errors.label}</p>}
              </div>

              <div>
                <Label htmlFor="version">Version *</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => handleChange('version', e.target.value)}
                  placeholder="e.g. 1.0"
                />
                {errors.version && <p className="text-sm text-red-600 mt-1">{errors.version}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="issuerName">Issuer Name *</Label>
              <Input
                id="issuerName"
                value={formData.issuerName}
                onChange={(e) => handleChange('issuerName', e.target.value)}
                placeholder="e.g. Province of British Columbia"
              />
              {errors.issuerName && <p className="text-sm text-red-600 mt-1">{errors.issuerName}</p>}
            </div>

            <div>
              <Label htmlFor="issuerWebsite">Issuer Website</Label>
              <Input
                id="issuerWebsite"
                value={formData.issuerWebsite}
                onChange={(e) => handleChange('issuerWebsite', e.target.value)}
                placeholder="e.g. https://www.gov.bc.ca"
              />
            </div>

            <div>
              <Label htmlFor="description">Credential Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of what this credential represents"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="issuerDid">Issuer DID *</Label>
              <Input
                id="issuerDid"
                value={formData.issuerDid}
                onChange={(e) => handleChange('issuerDid', e.target.value)}
                placeholder="e.g. did:indy:candy:123..."
              />
              {errors.issuerDid && <p className="text-sm text-red-600 mt-1">{errors.issuerDid}</p>}
            </div>
          </div>

          {/* Ledger Identifiers */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Ledger Identifiers</h3>
            
            <div>
              <Label htmlFor="ledgerNetwork">Network</Label>
              <Select value={formData.ledgerNetwork} onValueChange={(value) => handleChange('ledgerNetwork', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEDGER_NETWORKS.map((network) => (
                    <SelectItem key={network.value} value={network.value}>
                      {network.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="schemaId">Schema ID *</Label>
              <Input
                id="schemaId"
                value={formData.schemaId}
                onChange={(e) => handleChange('schemaId', e.target.value)}
                placeholder="e.g. RGjWbW1eycP7fMf4QJvX8:2:Person:1.0"
              />
              {errors.schemaId && <p className="text-sm text-red-600 mt-1">{errors.schemaId}</p>}
            </div>

            <div>
              <Label htmlFor="credDefId">Credential Definition ID *</Label>
              <Input
                id="credDefId"
                value={formData.credDefId}
                onChange={(e) => handleChange('credDefId', e.target.value)}
                placeholder="e.g. RGjWbW1eycP7fMf4QJvX8:3:CL:13:Person"
              />
              {errors.credDefId && <p className="text-sm text-red-600 mt-1">{errors.credDefId}</p>}
            </div>
          </div>

          {/* Attributes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Attributes</h3>
            
            <div>
              <Label htmlFor="attributes">Attribute List *</Label>
              <Textarea
                id="attributes"
                value={formData.attributes}
                onChange={(e) => handleChange('attributes', e.target.value)}
                placeholder="Enter comma-separated attributes: given_names,family_name,birthdate,street_address,locality,region,postal_code"
                rows={3}
              />
              {errors.attributes && <p className="text-sm text-red-600 mt-1">{errors.attributes}</p>}
              <p className="text-sm text-gray-500 mt-1">Separate multiple attributes with commas</p>
            </div>
          </div>

          {/* Ecosystem & Interoperability */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Ecosystem & Interoperability</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ecosystem">Ecosystem</Label>
                <Input
                  id="ecosystem"
                  value={formData.ecosystem}
                  onChange={(e) => handleChange('ecosystem', e.target.value)}
                  placeholder="e.g. BC Ecosystem"
                />
              </div>

              <div>
                <Label htmlFor="interopProfile">Interoperability Profile</Label>
                <Select value={formData.interopProfile} onValueChange={(value) => handleChange('interopProfile', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AIP 1.0">AIP 1.0</SelectItem>
                    <SelectItem value="AIP 2.0">AIP 2.0</SelectItem>
                    <SelectItem value="W3C VC">W3C VC</SelectItem>
                    <SelectItem value="DIDComm v2">DIDComm v2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


          </div>

          {/* Documentation & Assets */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Documentation & Assets</h3>
            
            <div>
              <Label htmlFor="ocaBundleUrl">OCA Bundle URL</Label>
              <Input
                id="ocaBundleUrl"
                value={formData.ocaBundleUrl}
                onChange={(e) => handleChange('ocaBundleUrl', e.target.value)}
                placeholder="https://github.com/org/repo/tree/main/overlays or direct bundle.json URL"
              />
              {bundleUrlError && <p className="text-sm text-red-600 mt-1">{bundleUrlError}</p>}
              <p className="text-sm text-gray-500 mt-1">Optional: URL to OCA bundle for branding</p>
            </div>

            <div>
              <Label htmlFor="governanceUrl">Governance Document URL</Label>
              <Input
                id="governanceUrl"
                value={formData.governanceUrl}
                onChange={(e) => handleChange('governanceUrl', e.target.value)}
                placeholder="https://example.com/governance-doc.pdf"
              />
            </div>

            <div>
              <Label htmlFor="primaryColor">Primary Brand Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  placeholder="#4F46E5"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Used for default card styling when no OCA bundle is provided</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={importMutation.isPending}
          >
            {importMutation.isPending ? 'Importing...' : 'Import Credential'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}