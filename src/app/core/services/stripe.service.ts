import { inject, Injectable } from '@angular/core';
import { ConfirmationToken, loadStripe, Stripe, StripeAddressElement, StripeAddressElementOptions, StripeElements, StripePaymentElement } from '@stripe/stripe-js'
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CartService } from './cart.service';
import { Cart } from '../../shared/models/cart';
import { firstValueFrom, map } from 'rxjs';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  baseUrl = environment.apiUrl;
  private stripePromise: Promise<Stripe | null>;
  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private elements?: StripeElements;
  private addressElement?: StripeAddressElement;
  private paymentElement?: StripePaymentElement
  private accounService = inject(AccountService);

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  geStripeInstance() {
    return this.stripePromise;
  }


  async intializeElements() {
    if (!this.elements) {
      const stripe = await this.geStripeInstance();
      if (stripe) {
        const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());
        this.elements = stripe.elements({
          clientSecret: cart.clientSecret,
          appearance: { labels: 'floating' }
        })
      } else {
        throw new Error('Problem with stripe');
      }
    }
    return this.elements;
  }

  async createPaymentElement() {
    if (!this.paymentElement) {
      const elements = await this.intializeElements();
      if (elements) {
        this.paymentElement = elements.create('payment');
      } else {
        throw new Error('Elements Instance not intialzed');
      }
    }
    return this.paymentElement;

  }


  async createAddressElement() {
    if (!this.addressElement) {
      const elements = await this.intializeElements();
      if (elements) {
        const user = this.accounService.currentUser();
        let defaultValues: StripeAddressElementOptions['defaultValues'] = {};
        if (user) {
          defaultValues.name = user.firstName + ' ' + user.lastName;
        }
        if (user?.address) {
          defaultValues.address = {
            line1: user.address.line1,
            line2: user.address.line2,
            city: user.address.city,
            state: user.address.state,
            country: user.address.country,
            postal_code: user.address.postalCode
          }
        }
        const options: StripeAddressElementOptions = {
          mode: 'shipping',
          defaultValues
        };

        this.addressElement = elements.create('address', options);
      } else {
        throw new Error('Elements Instance not loaded');
      }
    }
    return this.addressElement
  }


  async createConfirmationToken() {
    const stripe = await this.geStripeInstance();
    const elements = await this.intializeElements();
    const results = await elements.submit();
    if (results.error) throw new Error(results.error.message);
    if (stripe) {
      return stripe.createConfirmationToken({ elements });
    } else {
      throw new Error('Problem with stripe');
    }
  }

  async confirmPayment(confirmationToken: ConfirmationToken) {
    const stripe = await this.geStripeInstance();
    const elements = await this.intializeElements();
    const results = await elements.submit();
    if (results.error) throw new Error(results.error.message);
    const clientSecret = this.cartService.cart()?.clientSecret;
    if (stripe && clientSecret) {
      return await stripe.confirmPayment({
        clientSecret: clientSecret,
        confirmParams: {
          confirmation_token: confirmationToken.id,
        },
        redirect: 'if_required'
      });
    } else {
      throw new Error('Problem with stripe');
    }
  }


createOrUpdatePaymentIntent() {
  const cart = this.cartService.cart();
  if (!cart) throw new Error('Problem with empty');
  return this.http.post<Cart>(this.baseUrl + 'payments/' + cart.id, {}).pipe(
    map(async cart => {
      await firstValueFrom(this.cartService.setCart(cart));
      return cart
    })
  )
}



disposeElements() {
  this.elements = undefined;
  this.addressElement = undefined;
  this.paymentElement = undefined;
}

}