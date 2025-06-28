// Form.io configuration and utilities
export const formioConfig = {
  // Base Form.io configuration
  language: 'en',
  i18n: {},
  
  // Custom component definitions for VC integration
  components: {
    // Extend default components with VC-specific properties
  },
  
  // Builder configuration
  builder: {
    basic: false,
    advanced: false,
    data: false,
    layout: false,
    premium: false,
    custom: {
      title: 'Form Components',
      default: true,
      weight: 10,
      components: {
        textfield: true,
        email: true,
        select: true,
        checkbox: true,
        textarea: true,
        number: true,
        datetime: true,
        verified: {
          title: 'Verified Field',
          key: 'verified',
          icon: 'shield-check',
          schema: {
            label: 'Verified Field',
            type: 'textfield',
            key: 'verified',
            input: true,
            tableView: true,
            customClass: 'verified-field',
            properties: {
              dataSource: 'verified'
            }
          }
        }
      }
    }
  }
};

// Helper function to extract VC metadata from form schema
export function extractVCMetadata(formSchema: any) {
  const metadata: any = {
    fields: {}
  };

  function processComponents(components: any[]) {
    components.forEach(component => {
      if (component.properties?.dataSource) {
        metadata.fields[component.key] = {
          type: component.properties.dataSource,
          options: component.properties.options,
          vcMapping: component.properties.vcMapping
        };
      }
      
      if (component.components) {
        processComponents(component.components);
      }
    });
  }

  if (formSchema.components) {
    processComponents(formSchema.components);
  }

  return metadata;
}

// Helper function to inject VC metadata into form schema
export function injectVCMetadata(formSchema: any, metadata: any) {
  function processComponents(components: any[]) {
    components.forEach(component => {
      const fieldMeta = metadata.fields?.[component.key];
      if (fieldMeta) {
        component.properties = {
          ...component.properties,
          dataSource: fieldMeta.type,
          options: fieldMeta.options,
          vcMapping: fieldMeta.vcMapping
        };
      }
      
      if (component.components) {
        processComponents(component.components);
      }
    });
  }

  if (formSchema.components) {
    processComponents(formSchema.components);
  }

  return formSchema;
}
