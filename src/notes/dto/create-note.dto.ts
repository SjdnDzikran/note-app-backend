import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ example: 'Grocery list', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: '- Milk\n- Bread\n- Eggs' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
