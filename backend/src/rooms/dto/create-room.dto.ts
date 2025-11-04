// src/rooms/dto/create-room.dto.ts

import { IsString, IsNotEmpty, IsArray, IsUUID, ArrayMinSize, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name!: string; 
  
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @IsOptional() 
  memberIds?: string[]; 
}