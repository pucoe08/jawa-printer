import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrderParams } from '../../shared/models/orderParams';
import { Pagination } from '../../shared/models/pagination';
import { Order } from '../../shared/models/order';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getOrders(orderParams: OrderParams) {
    let params = new HttpParams();
    if (orderParams.filter && orderParams.filter !== 'All') {
      params = params.append('status', orderParams.filter)
    // HttpParams is immutable, so .append() does not modify params directly.
    //Instead, it returns a new HttpParams instance, and you need to reassign it.
    }
    params = params.append('pageIndex', orderParams.pageNumber);
    params = params.append('pageSize', orderParams.pageSize);
    return this.http.get<Pagination<Order>>(this.baseUrl + 'admin/orders', { params });
  }

  getOrder(id: Number) {
    return this.http.get<Order>(this.baseUrl + 'admin/orders/' + id);
  }

  refundOrder(id: Number) {
    return this.http.post<Order>(this.baseUrl + 'admin/orders/refund/' + id, {});
  }
}
