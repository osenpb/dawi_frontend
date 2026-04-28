import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private api: string = `${environment.apiUrl}/payment`;

  private http = inject(HttpClient);


  checkout(data: any) {
    return this.http.post(this.api, data);
  }


}
