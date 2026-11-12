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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { plainToInstance } from 'class-transformer';
import { NotesService } from './notes.service';
import { Note } from './note.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notes')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'A valid access token is required' })
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  private toResponseDto(note: Note): NoteResponseDto {
    return plainToInstance(NoteResponseDto, note, {
      enableImplicitConversion: true,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiCreatedResponse({
    description: 'The note that was created',
    type: NoteResponseDto,
  })
  create(
    @Body() payload: CreateNoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NoteResponseDto> {
    return this.notesService
      .create(payload, user.id)
      .then((note) => this.toResponseDto(note));
  }

  @Get()
  @ApiOperation({ summary: 'List all notes for the authenticated user' })
  @ApiOkResponse({
    description: 'Array of notes',
    type: NoteResponseDto,
    isArray: true,
  })
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<NoteResponseDto[]> {
    return this.notesService
      .findAll(user.id)
      .then((notes) => notes.map((note) => this.toResponseDto(note)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific note by id' })
  @ApiOkResponse({
    description: 'The note with the provided id',
    type: NoteResponseDto,
  })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NoteResponseDto> {
    return this.notesService
      .findOne(id, user.id)
      .then((note) => this.toResponseDto(note));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing note' })
  @ApiOkResponse({ description: 'The updated note', type: NoteResponseDto })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateNoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NoteResponseDto> {
    return this.notesService
      .update(id, user.id, payload)
      .then((note) => this.toResponseDto(note));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note' })
  @ApiNoContentResponse({ description: 'Note deleted successfully' })
  @HttpCode(204)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.notesService.remove(id, user.id);
  }
}
