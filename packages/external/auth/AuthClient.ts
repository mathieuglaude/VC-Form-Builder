import { RestClient } from '../rest-client';

export class AuthClient extends RestClient {
  /** POST /login  -> { token } */
  login(email: string, password: string) {
    return this.sdk
      .post('login', { json: { email, password } })
      .json<{ token: string }>();
  }

  /** GET /me -> { id, email, role } */
  profile() {
    return this.sdk
      .get('me')
      .json<{ id: string; email: string; role: string }>();
  }

  /** POST /logout */
  logout() {
    return this.sdk.post('logout').json<void>();
  }
}