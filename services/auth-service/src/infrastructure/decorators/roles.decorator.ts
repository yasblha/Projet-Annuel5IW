import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@Database/models/enums/userRole.enum';

/**
 * Décorateur pour définir les rôles autorisés à accéder à une route
 * @param roles Liste des rôles autorisés
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
