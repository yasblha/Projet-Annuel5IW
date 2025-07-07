export class SendMailDto {
  to: string;
  name: string;
  firstname?: string;
  lastname?: string;
  role?: string;
  tenantId?: string;
}
