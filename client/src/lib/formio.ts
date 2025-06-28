// Form.io configuration and utilities
export const formioConfig = {
  // Base Form.io configuration
  language: 'en',
  i18n: {},
  
  // Enhanced builder configuration with all components enabled
  builder: {
    // Basic components - most commonly used
    basic: {
      title: 'Basic Components',
      weight: 0,
      default: true,
      components: {
        textfield: true,
        textarea: true,
        number: true,
        password: true,
        checkbox: true,
        selectboxes: true,
        select: true,
        radio: true,
        email: true,
        url: true,
        phoneNumber: true,
        tags: true,
        datetime: true,
        button: true
      }
    },
    
    // Advanced components for complex logic
    advanced: {
      title: 'Advanced',
      weight: 10,
      components: {
        address: true,
        day: true,
        time: true,
        currency: true,
        survey: true,
        signature: true,
        file: true,
        hidden: true,
        htmlelement: true,
        content: true
      }
    },
    
    // Layout components for wizards and organization
    layout: {
      title: 'Layout',
      weight: 20,
      components: {
        columns: true,
        fieldset: true,
        panel: true,
        table: true,
        tabs: true,
        well: true
      }
    },
    
    // Data components for dynamic content
    data: {
      title: 'Data',
      weight: 30,
      components: {
        container: true,
        datagrid: true,
        editgrid: true
      }
    }
  },
  
  // Enable conditional logic and calculations
  options: {
    sanitize: true,
    template: 'bootstrap',
    iconset: 'fontawesome',
    hooks: {
      beforeSubmit: function(submission: any, next: Function) {
        // Hook for VC validation before submission
        next();
      }
    }
  }
};

// Enhanced form display options for wizards and advanced features
export const formDisplayOptions = {
  // Enable wizard mode
  wizard: {
    enabled: true,
    options: {
      breadcrumbSettings: {
        clickable: true
      },
      buttonSettings: {
        showCancel: true,
        showPrevious: true,
        showNext: true,
        showSubmit: true
      }
    }
  },
  
  // Enable conditional logic
  conditional: {
    enabled: true,
    options: {
      show: null,
      when: null,
      eq: ''
    }
  },
  
  // Enable calculations
  calculateValue: {
    enabled: true
  },
  
  // Enable validation
  validate: {
    required: false,
    custom: '',
    customPrivate: false,
    strictDateValidation: false,
    multiple: false,
    unique: false
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

// Helper to convert form to wizard format
export function convertToWizard(formSchema: any) {
  return {
    ...formSchema,
    display: 'wizard',
    components: formSchema.components || []
  };
}

// Helper to add conditional logic to components
export function addConditionalLogic(component: any, condition: any) {
  return {
    ...component,
    conditional: {
      show: condition.show || null,
      when: condition.when || null,
      eq: condition.eq || ''
    }
  };
}