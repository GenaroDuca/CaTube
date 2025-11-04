import { IsEmail, IsNotEmpty, IsString, IsOptional, IsIn, IsUrl, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6) 
    password: string;
    
    @IsOptional()
    @IsString()
    @IsIn(['user', 'admin'])
    userType?: string;

    @IsOptional()
    @IsString()
    @IsUrl({}, { message: 'avatarUrl debe ser una URL válida.' })
    avatarUrl?: string; 
}