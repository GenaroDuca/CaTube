import { IsOptional, IsString, Length, IsUrl } from 'class-validator';

export class UpdateUserDto {
  /**
   * Nombre de usuario (opcional). Usado para actualizar el username.
   */
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @Length(3, 20, { message: 'Username must be between 3 and 20 characters long' })
  username?: string;

  /**
   * Descripción o biografía del usuario (opcional).
   */
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(0, 255, { message: 'Description cannot exceed 255 characters' })
  description?: string;
  
  /**
   * URL del avatar (opcional). Incluido por si el frontend permite cambiarlo.
   */
  @IsOptional()
  @IsString({ message: 'Avatar URL must be a string' })
  @IsUrl({}, { message: 'Avatar URL must be a valid URL format' })
  avatarUrl?: string;

  // NOTA: No incluimos 'email' ni 'password' aquí por seguridad, 
  // ya que deberían tener sus propias rutas protegidas (ej. 'change-password').
}