import { Body, Controller, Get, Post, Delete, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CreateUserDto } from './dto-users/create-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {

        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll() {

        return this.usersService.findAll();
    }

    @Delete(':id')
    remove(@Param('id') id: string) {

        return this.usersService.remove(id);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async me(@Request() req) {
        const user = await this.usersService.findOneByUsername(req.user.username);
        return user;
    }
}
