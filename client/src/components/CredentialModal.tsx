import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CredentialTemplate } from "@shared/schema";

const attributeSchema = z.object({
  name: z.string().min(1, "Attribute name is required"),
  description: z.string().optional(),
});

const credentialTemplateSchema = z.object({
  label: z.string().min(1, "Label is required"),
  version: z.string().min(1, "Version is required"),
  schemaId: z.string().min(1, "Schema ID is required"),
  credDefId: z.string().min(1, "Credential Definition ID is required"),
  issuerDid: z.string().min(1, "Issuer DID is required"),
  schemaUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  attributes: z.array(attributeSchema).min(1, "At least one attribute is required"),
});

type FormData = z.infer<typeof credentialTemplateSchema>;

interface CredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: CredentialTemplate | null;
}

export default function CredentialModal({ isOpen, onClose, template }: CredentialModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!template;

  const form = useForm<FormData>({
    resolver: zodResolver(credentialTemplateSchema),
    defaultValues: {
      label: "",
      version: "1.0",
      schemaId: "",
      credDefId: "",
      issuerDid: "",
      schemaUrl: "",
      attributes: [{ name: "", description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attributes",
  });

  useEffect(() => {
    if (template && isOpen) {
      form.reset({
        label: template.label,
        version: template.version,
        schemaId: template.schemaId,
        credDefId: template.credDefId,
        issuerDid: template.issuerDid,
        schemaUrl: template.schemaUrl || "",
        attributes: template.attributes.length > 0 ? template.attributes : [{ name: "", description: "" }],
      });
    } else if (!template && isOpen) {
      form.reset({
        label: "",
        version: "1.0",
        schemaId: "",
        credDefId: "",
        issuerDid: "",
        schemaUrl: "",
        attributes: [{ name: "", description: "" }],
      });
    }
  }, [template, isOpen, form]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => fetch('/api/cred-lib', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        schemaUrl: data.schemaUrl || null,
      }),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cred-lib'] });
      toast({
        title: "Template created",
        description: "Credential template has been created successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create credential template.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => fetch(`/api/cred-lib/${template?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        schemaUrl: data.schemaUrl || null,
      }),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cred-lib'] });
      toast({
        title: "Template updated",
        description: "Credential template has been updated successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update credential template.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const addAttribute = () => {
    append({ name: "", description: "" });
  };

  const removeAttribute = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Credential Template" : "Add Credential Template"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the credential template details below."
              : "Create a new reusable credential template for form verification."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                {...form.register("label")}
                placeholder="BC Digital Business Card v1"
              />
              {form.formState.errors.label && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.label.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="version">Version *</Label>
              <Input
                id="version"
                {...form.register("version")}
                placeholder="1.0"
              />
              {form.formState.errors.version && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.version.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="schemaId">Schema ID *</Label>
            <Input
              id="schemaId"
              {...form.register("schemaId")}
              placeholder="M6M4n:2:DigitalBusinessCard:1.0"
              className="font-mono text-sm"
            />
            {form.formState.errors.schemaId && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.schemaId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="credDefId">Credential Definition ID *</Label>
            <Input
              id="credDefId"
              {...form.register("credDefId")}
              placeholder="M6M4n:3:CL:12345:tag"
              className="font-mono text-sm"
            />
            {form.formState.errors.credDefId && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.credDefId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="issuerDid">Issuer DID *</Label>
            <Input
              id="issuerDid"
              {...form.register("issuerDid")}
              placeholder="did:sov:M6M4n..."
              className="font-mono text-sm"
            />
            {form.formState.errors.issuerDid && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.issuerDid.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="schemaUrl">Schema Documentation URL</Label>
            <Input
              id="schemaUrl"
              {...form.register("schemaUrl")}
              placeholder="https://bcgov.github.io/digital-trust-toolkit/..."
              type="url"
            />
            {form.formState.errors.schemaUrl && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.schemaUrl.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Attributes *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttribute}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Attribute
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Input
                      {...form.register(`attributes.${index}.name`)}
                      placeholder="attribute_name"
                      className="font-mono text-sm"
                    />
                    {form.formState.errors.attributes?.[index]?.name && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.attributes[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      {...form.register(`attributes.${index}.description`)}
                      placeholder="Description (optional)"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttribute(index)}
                    disabled={fields.length === 1}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {form.formState.errors.attributes && (
              <p className="text-sm text-red-600 mt-1">
                At least one attribute is required
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : isEditing
                ? "Update Template"
                : "Create Template"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}