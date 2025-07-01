import { Formio } from 'formiojs';

export class FormioClient {
  private sdk: any;

  constructor(base: string) {
    this.sdk = new Formio(base);
  }

  // --- auth helpers -----------
  setToken(token: string) { 
    this.sdk.setToken(token); 
  }
  
  clearToken() { 
    this.sdk.setToken(null); 
  }

  // --- form helpers ----------
  loadForm(id: string) { 
    return this.sdk.loadForm(id); 
  }
  
  saveSubmission(id: string, data: any) {
    return this.sdk.saveSubmission(id, { data });
  }
}