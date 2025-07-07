import { RegisterDto } from '@application/dtos/auth/register.dto';
import { LoginDto } from '@application/dtos/auth/login.dto';
import { User } from '@domain/entité/user';

export function mapDtoToUser(dto: RegisterDto): User {
    // Utiliser motDePasse ou password selon ce qui est fourni
    const password = dto.motDePasse || dto.password || '';
    
    return new User(
        undefined,
        dto.nom,
        dto.prenom,
        dto.email,
        password,
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
        null,
        null,
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
        null,
        null,
        null
    );
}
