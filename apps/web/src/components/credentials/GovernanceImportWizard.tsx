import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Step components
import GovernanceDocumentStep from './wizard-steps/GovernanceDocumentStep';
import MetadataEditStep from './wizard-steps/MetadataEditStep';
import SchemaSelectionStep from './wizard-steps/SchemaSelectionStep';
import CredDefSelectionStep from './wizard-steps/CredDefSelectionStep';
import OCAPreviewStep from './wizard-steps/OCAPreviewStep';
import EcosystemTaggingStep from './wizard-steps/EcosystemTaggingStep';

interface GovernanceImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export interface ParsedGovernanceData {
  credentialName: string;
  issuerOrganization: string;
  issuerWebsite?: string;
  description: string;
  schemas: Array<{
    id: string;
    name: string;
    url: string;
    environment: 'test' | 'prod';
  }>;
  credentialDefinitions: Array<{
    id: string;
    name: string;
    schemaId: string;
    environment: 'test' | 'prod';
  }>;
  ocaBundleUrls: string[];
  governanceUrl?: string;
}

export interface SchemaData {
  schemaId: string;
  name: string;
  version: string;
  attributes: Array<{
    name: string;
    type: string;
    restrictions?: any;
  }>;
  issuerDid: string;
}

export interface CredDefData {
  credDefId: string;
  schemaId: string;
  tag: string;
  issuerDid: string;
  isValid: boolean;
}

export interface BrandingAssets {
  logo?: string;
  backgroundImage?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  layout?: string;
}

const steps = [
  { id: 1, name: 'Governance Document', description: 'Parse governance document' },
  { id: 2, name: 'Edit Metadata', description: 'Review and edit metadata' },
  { id: 3, name: 'Select Schema', description: 'Choose blockchain schema' },
  { id: 4, name: 'Select Credential Definition', description: 'Choose credential definition' },
  { id: 5, name: 'Preview Assets', description: 'Preview OCA branding' },
  { id: 6, name: 'Complete', description: 'Tag ecosystem and finalize' },
];

export default function GovernanceImportWizard({ isOpen, onClose, onComplete }: GovernanceImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Wizard state
  const [governanceData, setGovernanceData] = useState<ParsedGovernanceData | null>(null);
  const [editedMetadata, setEditedMetadata] = useState<Partial<ParsedGovernanceData> | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<SchemaData | null>(null);
  const [selectedCredDef, setSelectedCredDef] = useState<CredDefData | null>(null);
  const [brandingAssets, setBrandingAssets] = useState<BrandingAssets | null>(null);
  const [ecosystemTag, setEcosystemTag] = useState<string>('');

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setGovernanceData(null);
    setEditedMetadata(null);
    setSelectedSchema(null);
    setSelectedCredDef(null);
    setBrandingAssets(null);
    setEcosystemTag('');
    setIsLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    resetWizard();
    onClose();
  }, [resetWizard, onClose]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepData: any) => {
    switch (currentStep) {
      case 1:
        setGovernanceData(stepData);
        break;
      case 2:
        setEditedMetadata(stepData);
        break;
      case 3:
        setSelectedSchema(stepData);
        break;
      case 4:
        setSelectedCredDef(stepData);
        break;
      case 5:
        setBrandingAssets(stepData);
        break;
      case 6:
        setEcosystemTag(stepData);
        break;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return governanceData !== null;
      case 2:
        return editedMetadata !== null;
      case 3:
        return selectedSchema !== null;
      case 4:
        return selectedCredDef !== null;
      case 5:
        return brandingAssets !== null;
      case 6:
        return ecosystemTag.length > 0;
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      onComplete: handleStepComplete,
      onNext: handleNext,
      isLoading,
      setIsLoading,
    };

    switch (currentStep) {
      case 1:
        return (
          <GovernanceDocumentStep
            {...stepProps}
            data={governanceData}
          />
        );
      case 2:
        return (
          <MetadataEditStep
            {...stepProps}
            governanceData={governanceData!}
            data={editedMetadata}
          />
        );
      case 3:
        return (
          <SchemaSelectionStep
            {...stepProps}
            governanceData={editedMetadata || governanceData!}
            data={selectedSchema}
          />
        );
      case 4:
        return (
          <CredDefSelectionStep
            {...stepProps}
            selectedSchema={selectedSchema!}
            governanceData={editedMetadata || governanceData!}
            data={selectedCredDef}
          />
        );
      case 5:
        return (
          <OCAPreviewStep
            {...stepProps}
            governanceData={editedMetadata || governanceData!}
            data={brandingAssets}
          />
        );
      case 6:
        return (
          <EcosystemTaggingStep
            {...stepProps}
            metadata={editedMetadata || governanceData!}
            schemaData={selectedSchema!}
            credDefData={selectedCredDef!}
            brandingAssets={brandingAssets!}
            data={ecosystemTag}
            onComplete={onComplete}
            onClose={handleClose}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Import Credential from Governance Document</DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Step {currentStep} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between px-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center space-y-2">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium",
                  currentStep > step.id
                    ? "bg-green-500 border-green-500 text-white"
                    : currentStep === step.id
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-gray-100 border-gray-300 text-gray-500"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-xs font-medium",
                  currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                )}>
                  {step.name}
                </div>
                <div className="text-xs text-gray-500 max-w-20 text-center">
                  {step.description}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "absolute h-0.5 w-16 translate-x-12 -translate-y-4",
                  currentStep > step.id ? "bg-green-500" : "bg-gray-300"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-auto py-4">
          {renderCurrentStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isLoading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                // Final step completion handled by EcosystemTaggingStep
              }}
              disabled={!isStepValid() || isLoading}
            >
              Complete Import
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}