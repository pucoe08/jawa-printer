import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Address, User } from '../../shared/models/user';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  dummyUser: User = {
    firstName: "pankaj",
    lastName: "kumar",
    email: "pucoe07@gmail.com",
    address: {
      line1: "string1",
      line2: "string2",
      city: "string3",
      state: "string4",
      country: "string5",
      postalCode: 1
    }

  }

  login(values: any) {
    let params = new HttpParams();
    params = params.append('useCookies', true);
    return this.http.post(this.baseUrl + 'login', values, { params });
  }

  register(values: any) {
    return this.http.post(this.baseUrl + 'account/register', values);
  }

  getUserInfo() {
    return this.http.get<User>(this.baseUrl + 'account/user-info').pipe(
      map(user => {
        console.log(user)
          this.currentUser.set(this.dummyUser);  // for-test
          //this.currentUser.set(user);
        return user;
      })
    )
  }

  logout() {
    return this.http.post(this.baseUrl + 'logout', {})
  }

  updateAddress(address: Address) {
    return this.http.put(this.baseUrl + 'account/address', address);
  }

  getAuthState() {
    return this.http.get<{ isAuthenticated: boolean }>(this.baseUrl + 'account/auth-status');
  }

}
