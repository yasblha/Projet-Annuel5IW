import { ClientProxy } from '@nestjs/microservices';
export declare class MailAdapter {
    private mailerClient;
    constructor(mailerClient: ClientProxy);
    sendInvitation(email: string, activationToken: string, role: string): import("rxjs").Observable<any>;
    sendPasswordReset(email: string, resetToken: string): import("rxjs").Observable<any>;
    sendPasswordExpirationNotice(email: string): import("rxjs").Observable<any>;
    sendRegistrationConfirmation(email: string, firstName: string, lastName: string, activationToken: string): import("rxjs").Observable<any>;
}
