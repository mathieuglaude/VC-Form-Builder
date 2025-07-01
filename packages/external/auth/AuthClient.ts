import { RestClient } from '../rest-client';

export class AuthClient extends RestClient {
  constructor(base: string) { 
    super(base); 
  }

  login(email: string, pwd: string) {
    return this.sdk.post('login', { json: { email, pwd } }).json<{ token: string }>();
  }
  
  profile() {
    return this.sdk.get('me').json<{ id: string; email: string; role: string }>();
  }
}