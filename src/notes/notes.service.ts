import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CreateNoteDto } from './dto/create-note.dto';
import type { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
  ) {}

  create(payload: CreateNoteDto, ownerId: string): Promise<Note> {
    const note = this.notesRepository.create({ ...payload, ownerId });
    return this.notesRepository.save(note);
  }

  async findAll(ownerId: string): Promise<Note[]> {
    return this.notesRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, ownerId: string): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id, ownerId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(
    id: string,
    ownerId: string,
    payload: UpdateNoteDto,
  ): Promise<Note> {
    const note = await this.findOne(id, ownerId);
    const merged = this.notesRepository.merge(note, payload);
    return this.notesRepository.save(merged);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const result = await this.notesRepository.delete({ id, ownerId });
    if (result.affected === 0) {
      throw new NotFoundException('Note not found');
    }
  }
}
