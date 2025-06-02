import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';

@Injectable()
export class WorkOrderService {
    private counter = 1000;

    async generateWorkOrderNumber(): Promise<string> {
        const date = format(new Date(), 'yyyyMMdd');
        const number = this.counter++;
        return `WO-${date}-${number.toString().padStart(4, '0')}`;
    }

    async generateMaintenanceOrderNumber(): Promise<string> {
        const date = format(new Date(), 'yyyyMMdd');
        const number = this.counter++;
        return `MO-${date}-${number.toString().padStart(4, '0')}`;
    }

    async generateEmergencyOrderNumber(): Promise<string> {
        const date = format(new Date(), 'yyyyMMdd');
        const number = this.counter++;
        return `EO-${date}-${number.toString().padStart(4, '0')}`;
    }
} 