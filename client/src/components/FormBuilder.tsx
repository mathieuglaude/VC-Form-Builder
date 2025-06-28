import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FormBuilder as FormioBuilder } from "@formio/react";
import { formioConfig, extractVCMetadata } from "@/lib/formio";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface FormBuilderProps {
  initialForm?: any;
  onSave: (formData: any) => void;
  onPreview: (formData: any) => void;
}

export default function FormBuilder({ initialForm, onSave, onPreview }: FormBuilderProps) {
  const [formTitle, setFormTitle] = useState(initialForm?.name || "");
  const [formDescription, setFormDescription] = useState(initialForm?.description || "");
  const [formSchema, setFormSchema] = useState<any>(initialForm?.formSchema || { 
    display: 'form',
    components: [] 
  });
  const [isWizard, setIsWizard] = useState(initialForm?.formSchema?.display === 'wizard');
  const { toast } = useToast();

  // Handle form schema changes from Form.io builder
  const handleFormChange = useCallback((form: any) => {
    console.log('Form schema updated:', form);
    setFormSchema(form);
  }, []);

  // Toggle between form and wizard display
  const handleDisplayToggle = useCallback((checked: boolean) => {
    setIsWizard(checked);
    setFormSchema((prev: any) => ({
      ...prev,
      display: checked ? 'wizard' : 'form'
    }));
  }, []);

  // Extract metadata for VC integration
  const extractMetadata = useCallback(() => {
    return extractVCMetadata(formSchema);
  }, [formSchema]);

  // Handle save
  const handleSave = useCallback(() => {
    const formData = {
      title: formTitle,
      description: formDescription,
      formSchema: formSchema,
      metadata: extractMetadata()
    };
    console.log('Saving form:', formData);
    onSave(formData);
  }, [formTitle, formDescription, formSchema, extractMetadata, onSave]);

  // Handle preview
  const handlePreview = useCallback(() => {
    const formData = {
      title: formTitle,
      description: formDescription,
      formSchema: formSchema,
      metadata: extractMetadata()
    };
    onPreview(formData);
  }, [formTitle, formDescription, formSchema, extractMetadata, onPreview]);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-2xl">
            <Input
              placeholder="Form Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-lg font-medium mb-2"
            />
            <Textarea
              placeholder="Form Description (optional)"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="text-sm resize-none"
              rows={2}
            />
          </div>
          
          <div className="flex items-center gap-4 ml-6">
            {/* Wizard Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="wizard-mode"
                checked={isWizard}
                onCheckedChange={handleDisplayToggle}
              />
              <Label htmlFor="wizard-mode" className="text-sm font-medium">
                Wizard Mode
              </Label>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePreview}>
                Preview
              </Button>
              <Button onClick={handleSave}>
                Save Form
              </Button>
            </div>
          </div>
        </div>
        
        {/* Form Info */}
        <div className="flex items-center gap-4 mt-3">
          <Badge variant={isWizard ? "default" : "secondary"}>
            {isWizard ? "Multi-Step Wizard" : "Single Page Form"}
          </Badge>
          {formSchema.components && formSchema.components.length > 0 && (
            <Badge variant="outline">
              {formSchema.components.length} Components
            </Badge>
          )}
        </div>
      </div>

      {/* Form Builder */}
      <div className="flex-1 bg-gray-50">
        <div className="h-full">
          <div className="formio-builder-container">
            <FormioBuilder
              form={formSchema}
              onChange={handleFormChange}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Form.io Builder - Drag components from the sidebar to build your form
          </div>
          <div className="flex items-center gap-4">
            {isWizard && (
              <span className="text-blue-600 font-medium">
                ✨ Wizard mode enabled - Use panels to create steps
              </span>
            )}
            <span>
              {formSchema.components?.length || 0} components
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}