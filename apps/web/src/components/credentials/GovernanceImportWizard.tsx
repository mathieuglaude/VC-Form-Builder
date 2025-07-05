import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  const [step1Valid, setStep1Valid] = useState(false);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setGovernanceData(null);
    setEditedMetadata(null);
    setSelectedSchema(null);
    setSelectedCredDef(null);
    setBrandingAssets(null);
    setEcosystemTag('');
    setStep1Valid(false);
    setIsLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    resetWizard();
    onClose();
  }, [resetWizard, onClose]);

  const handleNext = async () => {
    if (currentStep < steps.length) {
      // For step 1, the GovernanceDocumentStep handles its own Next behavior
      // Other steps can proceed normally
      if (currentStep !== 1) {
        setCurrentStep(currentStep + 1);
      }
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
        return step1Valid;
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
            onStepAdvance={() => setCurrentStep(currentStep + 1)}
            onValidationChange={setStep1Valid}
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



  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Import Credential from Governance Document</DialogTitle>
        </DialogHeader>

        {/* Clean Progress Indicator */}
        <div className="flex-shrink-0 px-1 py-4 border-b">
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-900">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          
          {/* Desktop Progress Steps */}
          <div className="hidden md:block relative">
            <div className="flex items-start justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center relative" style={{ width: `${100 / steps.length}%` }}>
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 relative z-10",
                      currentStep > step.id
                        ? "bg-green-500 text-white shadow-md"
                        : currentStep === step.id
                        ? "bg-blue-500 text-white shadow-lg ring-4 ring-blue-100"
                        : "bg-gray-200 text-gray-600"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-3 text-center px-2">
                    <div className={cn(
                      "text-xs font-medium mb-1",
                      currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                    )}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500 leading-tight">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Connection Lines */}
            <div className="absolute top-5 left-0 right-0 flex items-center justify-between px-5">
              {steps.slice(0, -1).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1 rounded-full transition-colors duration-200",
                    currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"
                  )}
                  style={{ width: `calc(${100 / (steps.length - 1)}% - 40px)` }}
                />
              ))}
            </div>
          </div>

          {/* Mobile Progress Steps */}
          <div className="md:hidden">
            <div className="flex items-center space-x-3 mb-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-200",
                    currentStep > step.id
                      ? "bg-green-500"
                      : currentStep === step.id
                      ? "bg-blue-500 ring-2 ring-blue-200"
                      : "bg-gray-200"
                  )}
                />
              ))}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                {steps[currentStep - 1]?.name}
              </div>
              <div className="text-xs text-gray-500">
                {steps[currentStep - 1]?.description}
              </div>
            </div>
          </div>
        </div>

        {/* Step Content with Proper Scrolling */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {renderCurrentStep()}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 pt-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isLoading}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
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