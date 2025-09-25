import {IsNotEmpty, MaxLength } from 'class-validator';

export class CreateStoreDto {
    @IsNotEmpty()
    @MaxLength(25)
    store_name: string;

    @MaxLength(350)
    description: string;
}
