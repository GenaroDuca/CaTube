import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    @MaxLength(60)
    product_name: string;

    @MaxLength(255)
    description: string;

    @IsNotEmpty()
    price: number;

    @IsNotEmpty()
    stock: number;
}
