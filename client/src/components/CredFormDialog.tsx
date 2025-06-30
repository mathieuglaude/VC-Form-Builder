import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CredentialTemplate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CredFormDialogProps {
  initial: Partial<CredentialTemplate>;
  onClose: () => void;
  onSaved: () => void;
}

export function CredFormDialog({ initial, onClose, onSaved }: CredFormDialogProps) {
  const [form, setForm] = useState<Partial<CredentialTemplate>>({
    label: "",
    version: "1.0",
    schemaId: "",
    credDefId: "",
    issuerDid: "",
    attributes: [],
    ecosystem: "",
    interopProfile: "",
    isPredefined: false,
    walletRestricted: false,
    compatibleWallets: [],
    metaOverlay: {
      issuer: "",
      description: "",
    },
    ...initial,
  });

  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: async () => {
      const method = form.id ? "PUT" : "POST";
      const url = form.id 
        ? `/api/admin/credentials/${form.id}` 
        : "/api/admin/credentials";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save credential template");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: `Credential template ${form.id ? 'updated' : 'created'} successfully` });
      onSaved();
    },
    onError: () => {
      toast({ 
        title: `Failed to ${form.id ? 'update' : 'create'} credential template`,
        variant: "destructive"
      });
    },
  });

  const handleAttributesChange = (value: string) => {
    const attributes = value
      .split(",")
      .map((attr) => ({ name: attr.trim() }))
      .filter((attr) => attr.name.length > 0);
    setForm({ ...form, attributes });
  };

  const handleCompatibleWalletsChange = (value: string) => {
    const wallets = value
      .split(",")
      .map((wallet) => wallet.trim())
      .filter((wallet) => wallet.length > 0);
    setForm({ ...form, compatibleWallets: wallets });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {form.id ? "Edit" : "New"} Credential Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                placeholder="e.g., BC Digital Business Card v1"
                value={form.label || ""}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                placeholder="1.0"
                value={form.version || ""}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
              />
            </div>
          </div>

          {/* Issuer Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer Name</Label>
              <Input
                id="issuer"
                placeholder="e.g., Government of British Columbia"
                value={form.metaOverlay?.issuer || ""}
                onChange={(e) => setForm({ 
                  ...form, 
                  metaOverlay: { ...form.metaOverlay, issuer: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuerDid">Issuer DID</Label>
              <Input
                id="issuerDid"
                placeholder="did:indy:..."
                value={form.issuerDid || ""}
                onChange={(e) => setForm({ ...form, issuerDid: e.target.value })}
              />
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-2">
            <Label htmlFor="schemaId">Schema ID *</Label>
            <Input
              id="schemaId"
              placeholder="e.g., M6dhuFj5UwbhWkSLmvYSPc:2:digital-business-card:1.0"
              value={form.schemaId || ""}
              onChange={(e) => setForm({ ...form, schemaId: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credDefId">Credential Definition ID</Label>
            <Input
              id="credDefId"
              placeholder="e.g., M6dhuFj5UwbhWkSLmvYSPc:3:CL:2351:business-card"
              value={form.credDefId || ""}
              onChange={(e) => setForm({ ...form, credDefId: e.target.value })}
            />
          </div>

          {/* Attributes */}
          <div className="space-y-2">
            <Label htmlFor="attributes">Attributes (comma-separated)</Label>
            <Textarea
              id="attributes"
              placeholder="given_name, surname, email, organization"
              value={(form.attributes || []).map(attr => typeof attr === 'string' ? attr : attr.name).join(", ")}
              onChange={(e) => handleAttributesChange(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the credential..."
              value={form.metaOverlay?.description || ""}
              onChange={(e) => setForm({ 
                ...form, 
                metaOverlay: { ...form.metaOverlay, description: e.target.value }
              })}
            />
          </div>

          {/* Ecosystem and Interop */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ecosystem">Ecosystem</Label>
              <Select
                value={form.ecosystem || ""}
                onValueChange={(value) => setForm({ ...form, ecosystem: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ecosystem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BC Ecosystem">BC Ecosystem</SelectItem>
                  <SelectItem value="Canadian Ecosystem">Canadian Ecosystem</SelectItem>
                  <SelectItem value="Global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interopProfile">Interop Profile</Label>
              <Select
                value={form.interopProfile || ""}
                onValueChange={(value) => setForm({ ...form, interopProfile: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AIP 2.0">AIP 2.0</SelectItem>
                  <SelectItem value="AIP 1.0">AIP 1.0</SelectItem>
                  <SelectItem value="W3C">W3C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Wallet Compatibility */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="walletRestricted"
                checked={form.walletRestricted || false}
                onCheckedChange={(checked) => setForm({ ...form, walletRestricted: !!checked })}
              />
              <Label htmlFor="walletRestricted">Restrict to specific wallets</Label>
            </div>
            
            {form.walletRestricted && (
              <div className="space-y-2">
                <Label htmlFor="compatibleWallets">Compatible Wallets (comma-separated)</Label>
                <Input
                  id="compatibleWallets"
                  placeholder="BC Wallet, NB Orbit Edge Wallet"
                  value={(form.compatibleWallets || []).join(", ")}
                  onChange={(e) => handleCompatibleWalletsChange(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* System Template */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPredefined"
              checked={form.isPredefined || false}
              onCheckedChange={(checked) => setForm({ ...form, isPredefined: !!checked })}
            />
            <Label htmlFor="isPredefined">Mark as system template (prevents editing)</Label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !form.label || !form.schemaId}
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}