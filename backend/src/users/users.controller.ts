import { Body, Controller, Get, Post, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { CreateUserDto } from './dto-users/create-user.dto';
import { UsersService } from './users.service';

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
    remove(@Param('id', ParseIntPipe) id: string) {

        return this.usersService.remove(id);
    }
}