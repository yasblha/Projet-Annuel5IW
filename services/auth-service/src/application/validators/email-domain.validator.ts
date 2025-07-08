import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'EmailDomain', async: false })
export class EmailDomainValidator implements ValidatorConstraintInterface {
  validate(email: string, args: ValidationArguments) {
    const allowedDomains = ['entreprise.com', 'organisation.org']; // À adapter
    if (!email || typeof email !== 'string') return false;
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  }

  defaultMessage(args: ValidationArguments) {
    return "L'email doit appartenir à un domaine autorisé (entreprise.com, organisation.org)";
  }
} 