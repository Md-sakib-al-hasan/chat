import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class uploadImageAndDto {
  @IsString()
  @ApiProperty({
    example: 'Electronics',
    description: 'The name of the category',
  })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Devices, gadgets, and tech products',
    description: 'Optional description for the category',
    required: false,
  })
  description?: string;
}
