import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    @MaxLength(25)
    product_name: string;

    @MaxLength(350)
    description: string;

    @IsNotEmpty()
    price: number;

    @IsNotEmpty()
    stock: number;
}
