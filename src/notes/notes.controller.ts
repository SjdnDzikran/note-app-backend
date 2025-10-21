import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';

@ApiTags('Notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiCreatedResponse({ description: 'The note that was created', type: NoteResponseDto })
  create(@Body() payload: CreateNoteDto): Promise<NoteResponseDto> {
    return this.notesService.create(payload);
  }

  @Get()
  @ApiOperation({ summary: 'List all notes' })
  @ApiOkResponse({ description: 'Array of notes', type: [NoteResponseDto] })
  findAll(): Promise<NoteResponseDto[]> {
    return this.notesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific note by id' })
  @ApiOkResponse({ description: 'The note with the provided id', type: NoteResponseDto })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<NoteResponseDto> {
    return this.notesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing note' })
  @ApiOkResponse({ description: 'The updated note', type: NoteResponseDto })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateNoteDto,
  ): Promise<NoteResponseDto> {
    return this.notesService.update(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note' })
  @ApiNoContentResponse({ description: 'Note deleted successfully' })
  @HttpCode(204)
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.notesService.remove(id);
  }
}
