import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';

interface FormRendererProps {
  formSchema: any;
  formData: Record<string, any>;
  verifiedFields: Record<string, any>;
  onFieldChange: (fieldKey: string, value: any) => void;
  onSubmit?: (e: React.FormEvent) => void;
  mode: 'preview' | 'launch' | 'public';
  isSubmitting?: boolean;
}

export default function FormRenderer({
  formSchema,
  formData,
  verifiedFields,
  onFieldChange,
  onSubmit,
  mode,
  isSubmitting = false
}: FormRendererProps) {
  const getFieldValue = (fieldKey: string) => {
    // Check for verified field value first, then form data
    const component = formSchema?.components?.find((c: any) => c.key === fieldKey);
    if (component?.vcMapping?.attributeName && verifiedFields[component.vcMapping.attributeName]) {
      return verifiedFields[component.vcMapping.attributeName];
    }
    return formData[fieldKey] || '';
  };

  const renderField = (component: any) => {
    const fieldKey = component.key;
    const hasVerifiedMapping = component.vcMapping?.attributeName && verifiedFields[component.vcMapping.attributeName];
    const isVerified = !!hasVerifiedMapping;
    const isReadOnly = isVerified;

    switch (component.type) {
      case 'textfield':
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
                {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isVerified && <VerifiedBadge />}
            </div>
            <Input
              type="text"
              value={getFieldValue(fieldKey)}
              onChange={(e) => onFieldChange(fieldKey, e.target.value)}
              placeholder={component.placeholder}
              required={component.validate?.required}
              readOnly={isReadOnly}
              className={isReadOnly ? "bg-green-50 border-green-200" : ""}
            />
          </div>
        );

      case 'email':
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
                {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isVerified && <VerifiedBadge />}
            </div>
            <Input
              type="email"
              value={getFieldValue(fieldKey)}
              onChange={(e) => onFieldChange(fieldKey, e.target.value)}
              placeholder={component.placeholder}
              required={component.validate?.required}
              readOnly={isReadOnly}
              className={isReadOnly ? "bg-green-50 border-green-200" : ""}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
                {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isVerified && <VerifiedBadge />}
            </div>
            <Textarea
              value={getFieldValue(fieldKey)}
              onChange={(e) => onFieldChange(fieldKey, e.target.value)}
              placeholder={component.placeholder}
              required={component.validate?.required}
              readOnly={isReadOnly}
              className={isReadOnly ? "bg-green-50 border-green-200" : ""}
            />
          </div>
        );

      case 'select':
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
                {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isVerified && <VerifiedBadge />}
            </div>
            <Select
              value={getFieldValue(fieldKey)}
              onValueChange={(value) => onFieldChange(fieldKey, value)}
              disabled={isReadOnly}
            >
              <SelectTrigger className={isReadOnly ? "bg-green-50 border-green-200" : ""}>
                <SelectValue placeholder={component.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {component.data?.values?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'number':
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
                {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isVerified && <VerifiedBadge />}
            </div>
            <Input
              type="number"
              value={getFieldValue(fieldKey)}
              onChange={(e) => onFieldChange(fieldKey, parseFloat(e.target.value) || '')}
              placeholder={component.placeholder}
              required={component.validate?.required}
              readOnly={isReadOnly}
              className={isReadOnly ? "bg-green-50 border-green-200" : ""}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={getFieldValue(fieldKey) || false}
                onCheckedChange={(checked) => onFieldChange(fieldKey, checked)}
                disabled={isReadOnly}
              />
              <label className="text-sm font-medium text-gray-700">
                {component.label}
                {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isVerified && <VerifiedBadge />}
            </div>
          </div>
        );

      case 'datetime':
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
                {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isVerified && <VerifiedBadge />}
            </div>
            <Input
              type="datetime-local"
              value={getFieldValue(fieldKey)}
              onChange={(e) => onFieldChange(fieldKey, e.target.value)}
              required={component.validate?.required}
              readOnly={isReadOnly}
              className={isReadOnly ? "bg-green-50 border-green-200" : ""}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {formSchema?.components?.map((component: any) => renderField(component))}
      
      {mode !== 'preview' && onSubmit && (
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Form
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}