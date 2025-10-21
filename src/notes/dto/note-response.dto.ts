import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class NoteResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  content!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  updatedAt!: Date;
}
