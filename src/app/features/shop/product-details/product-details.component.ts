import { Component, inject, OnInit } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../shared/models/product';
import { CurrencyPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import { CartService } from '../../../core/services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CurrencyPipe,
    MatButton,
    MatIcon,
    MatFormField,
    MatInput,
    MatLabel,
    MatDivider,
    FormsModule
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  private shopService = inject(ShopService);
  private cartService = inject(CartService);
  private activatedRoute = inject(ActivatedRoute);
  product?: Product;
  quantityInCart = 0;
  quantity = 1;

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) return;
    this.shopService.getProduct(id).subscribe({
      next: product => {
        this.product = product
        this.updateQuantityInCart_Variable();
      },
      error: err => console.log(err)
    })
  }


  updateQuantityInCart_Variable() {
    this.quantityInCart = this.cartService.cart()?.items
      .find(x => x.productId === this.product?.id)?.quantity || 0;
    this.quantity = this.quantityInCart || 1;

  }


  getButtonText() {
    return this.quantityInCart > 0 ? 'Update Cart' : 'Add to Cart';
  }

  updateCart() {
    if (!this.product) return;   // this is just type script check so that no compiler complaints
    if (this.quantity > this.quantityInCart) {
      const itemToAdd = this.quantity - this.quantityInCart;
      this.quantityInCart += itemToAdd;
      this.cartService.addItemToCart(this.product, itemToAdd)
    }
    else {
      const itemsToRemove = this.quantityInCart - this.quantity;
      this.quantityInCart -= itemsToRemove;
      this.cartService.removeItemFromCart(this.product.id, itemsToRemove);
    }
  }

}
