export class CreateUserDto {
    username: string;
    email: string;
    password: string;
    userType?: string; // El '?' hace que este campo sea opcional
}