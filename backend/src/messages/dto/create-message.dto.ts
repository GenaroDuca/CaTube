import { IsString, IsNotEmpty, IsUUID, MinLength } from 'class-validator';
export class CreateMessageDto {

  @IsUUID('4', { message: 'targetUserId debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID del destinatario es obligatorio.' })
  targetUserId: string; 

  @IsString({ message: 'El contenido del mensaje debe ser texto.' })
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío.' })
  @MinLength(1, { message: 'El mensaje debe tener al menos un carácter.' })
  content: string;
}