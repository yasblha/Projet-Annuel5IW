import axios from 'axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class CatalogService implements OnModuleInit {
  private readonly logger = new Logger('CatalogService');
  private catalog: any = { actions: [], events: [] };

  async onModuleInit() {
    await this.refresh();
    // refresh every 5 minutes
    setInterval(() => this.refresh(), 5 * 60 * 1000);
  }

  async refresh() {
    try {
      const services = [
        { name: 'operation', url: process.env.OPERATION_URL || 'http://operation-service:3000' },
        { name: 'intervention', url: process.env.INTERVENTION_URL || 'http://intervention-service:3000' },
        { name: 'contrat', url: process.env.CONTRAT_URL || 'http://contrat-service:3000' },
      ];
      const promises = services.map(s => axios.get(`${s.url}/metadata`).then(r => r.data).catch(() => null));
      const results = await Promise.all(promises);
      this.catalog = results.filter(Boolean).reduce((acc, cur) => {
        acc.actions.push(...cur.actions);
        acc.events.push(...cur.events);
        return acc;
      }, { actions: [], events: [] });
      this.logger.log(`Catalog refreshed: ${this.catalog.actions.length} actions, ${this.catalog.events.length} events`);
    } catch (err) {
      this.logger.error('Catalog refresh error', err);
    }
  }

  getCatalog() {
    return this.catalog;
  }
}
