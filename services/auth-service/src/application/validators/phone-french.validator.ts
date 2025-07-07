import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'PhoneFrench', async: false })
export class PhoneFrenchValidator implements ValidatorConstraintInterface {
  validate(phone: string, args: ValidationArguments) {
    if (!phone || typeof phone !== 'string') return false;
    return /^((\+33|0)[1-9](\d{2}){4})$/.test(phone);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Le numéro de téléphone doit être un numéro français valide';
  }
} 