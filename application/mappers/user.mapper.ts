import { RegisterDto } from '@application/dtos/register.dto';
import { User } from '@domain/entité/user';

export function mapDtoToUser(dto: RegisterDto): User {
    return new User(
        undefined,
        dto.nom,
        dto.prenom,
        dto.email,
        dto.motDePasse,
        new Date(),
        false,
        null,
        0,
        null,
        dto.tenantId,
        dto.telephone ?? null,
        dto.role,
        'EN_ATTENTE_VALIDATION',
        null,
        new Date(),
        null
    );
}

/** Convertit un utilisateur JWT (ex: admin) en entité User simplifiée */
export function mapJwtToUser(jwt: any): User {
    return new User(
        undefined,
        jwt.nom,
        jwt.prenom,
        jwt.email,
        '',
        new Date(),
        false,
        null,
        0,
        null,
        jwt.tenantId,
        jwt.telephone ?? null,
        jwt.role,
        jwt.statut ?? 'ACTIF',
        null,
        new Date(),
        null
    );
}
