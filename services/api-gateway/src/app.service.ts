import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';

@Injectable()
export class AppService {
  constructor(private http: HttpService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async register(body: any) {
    const { data } = await this.http.post(`${AUTH_URL}/auth/register`, body).toPromise();
    return data;
  }

  async login(body: any) {
    const { data } = await this.http.post(`${AUTH_URL}/auth/login`, body).toPromise();
    return data;
  }

  async invite(body: any) {
    const { data } = await this.http.post(`${AUTH_URL}/auth/invite`, body).toPromise();
    return data;
  }

  async confirm(body: any) {
    const { data } = await this.http.post(`${AUTH_URL}/auth/confirm`, body).toPromise();
    return data;
  }

}
