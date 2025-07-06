import React from 'react';
import { createRoot } from 'react-dom/client';
import FormPage from '@/components/FormPage';

// Debug component for testing FormPage without full app context
function ReactFormDebug() {
  const formData = (window as any).__DEBUG_FORM_DATA__;
  const submitHandler = (window as any).__DEBUG_SUBMIT_HANDLER__;

  if (!formData) {
    return <div>Error: No form data provided</div>;
  }

  console.log('🔧 React Debug: Rendering FormPage with data:', formData);

  return (
    <div>
      <h2>{formData.title || formData.name}</h2>
      <p>{formData.description || 'Debug test form'}</p>
      
      <FormPage
        form={formData}
        mode="debug"
        onSubmit={submitHandler}
        isSubmitting={false}
        showHeader={false}
      />
    </div>
  );
}

// Render the debug component
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<ReactFormDebug />);
} else {
  console.error('Root container not found');
}