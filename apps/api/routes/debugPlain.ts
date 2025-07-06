import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Development-only route for testing pure Form.io rendering
router.get('/debug/plain/:formId', async (req, res) => {
  const formId = parseInt(req.params.formId);
  
  try {
    const form = await storage.getFormConfig(formId);
    
    if (!form) {
      return res.status(404).send('<h1>Form not found</h1>');
    }

    // Auto-append submit button if missing (for debug convenience)
    const schema = { ...form.formSchema };
    const hasSubmitButton = schema.components.some((comp: any) => 
      comp.type === 'button' && (comp.action === 'submit' || comp.key === 'submit')
    );
    
    if (!hasSubmitButton) {
      schema.components.push({
        key: 'submit',
        type: 'button',
        label: 'Submit',
        input: true,
        disableOnInvalid: true,
        action: 'submit',
        theme: 'primary'
      });
    }

    const schemaJson = JSON.stringify(schema);
    const componentsJson = JSON.stringify(schema.components, null, 2);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Debug Form.io Render - ${form.name}</title>
    <script src="https://cdn.form.io/formiojs/formio.full.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .debug-header {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #2196f3;
        }
        .form-container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .schema-details {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            font-family: monospace;
            font-size: 12px;
            border: 1px solid #ddd;
        }
        .submission-log {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
            border: 1px solid #4caf50;
            display: none;
        }
    </style>
</head>
<body>
    <div class="debug-header">
        <h1>🔧 Debug: Pure Form.io Render Test</h1>
        <p><strong>Form:</strong> ${form.name} (ID: ${formId})</p>
        <p><strong>Purpose:</strong> Test raw Form.io rendering without React wrappers</p>
        <p><strong>Schema Source:</strong> /api/forms/${formId}</p>
    </div>

    <div class="schema-details">
        <strong>Form Schema Components:</strong><br>
        ${componentsJson}
    </div>

    <div class="form-container">
        <h2>${form.title || form.name}</h2>
        <p>${form.description || ''}</p>
        <div id="formio-container"></div>
    </div>

    <div id="submission-log" class="submission-log">
        <h3>✅ Submission Successful</h3>
        <pre id="submission-data"></pre>
    </div>

    <script>
        console.log('🔧 Debug Form.io Test Starting...');
        console.log('Form Schema:', ${schemaJson});
        
        // Create Form.io instance
        Formio.createForm(document.getElementById('formio-container'), ${schemaJson})
            .then(function(form) {
                console.log('✅ Form.io form created successfully');
                
                // Handle form submission
                form.on('submit', function(submission) {
                    console.log('📤 Form Submission:', submission);
                    
                    // Show submission in UI
                    const logDiv = document.getElementById('submission-log');
                    const dataDiv = document.getElementById('submission-data');
                    dataDiv.textContent = JSON.stringify(submission, null, 2);
                    logDiv.style.display = 'block';
                    
                    // Prevent actual HTTP submission
                    return false;
                });
                
                // Log form validation events
                form.on('error', function(errors) {
                    console.log('❌ Form Validation Errors:', errors);
                });
                
                form.on('change', function(changed) {
                    console.log('🔄 Form Change:', changed);
                });
                
                console.log('🎯 Form ready for testing');
            })
            .catch(function(error) {
                console.error('💥 Form.io creation failed:', error);
                document.getElementById('formio-container').innerHTML = 
                    '<div style="color: red; padding: 20px; border: 1px solid red;">' +
                    '<h3>Form.io Render Failed</h3>' +
                    '<p>Error: ' + error.message + '</p>' +
                    '<p>Check console for details</p>' +
                    '</div>';
            });
    </script>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).send('<h1>Internal Server Error</h1><p>' + (error as Error).message + '</p>');
  }
});

export default router;