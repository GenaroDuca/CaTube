// src/messages/dto/get-history-query.dto.ts

import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetHistoryQueryDto {
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit: number = 50; 

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    skip: number = 0;
}