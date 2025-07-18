import { UsersService } from './users.service';
import { InviteUserDto } from './dto/invite-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    inviteUser(req: any, inviteUserDto: InviteUserDto): Promise<{
        message: string;
        user: {
            id: unknown;
            email: unknown;
            role: unknown;
            status: unknown;
        };
    }>;
    findAll(req: any): Promise<{
        id: unknown;
        email: unknown;
        firstName: unknown;
        lastName: unknown;
        role: unknown;
        status: unknown;
        agencyId: unknown;
        createdAt: unknown;
        updatedAt: unknown;
    }[]>;
    getProfile(req: any): Promise<unknown[]>;
}
