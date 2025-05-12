import { Controller, Post, Body, Req } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from '@application/dtos/register.dto';
import { mapDtoToUser, mapJwtToUser } from '@application/mappers/user.mapper';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly UsersService: UsersService) {}

    @Post('register')
    @ApiBody({ type: RegisterDto })
    registerPublic(@Body() dto: RegisterDto) {
        return this.UsersService.registerFromInterface(mapDtoToUser(dto));
    }

    @Post('admin/register')
    @ApiBearerAuth()
    @ApiBody({ type: RegisterDto })
    registerByAdmin(@Req() req, @Body() dto: RegisterDto) {
        const admin = mapJwtToUser(req.user);
        const newUser = mapDtoToUser(dto);
        return this.UsersService.registerFromAdmin(admin, newUser);
    }
}
