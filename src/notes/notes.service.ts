import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Note } from './note.entity';
import type { CreateNoteDto } from './dto/create-note.dto';
import type { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  private readonly notes = new Map<string, Note>();

  async create(payload: CreateNoteDto): Promise<Note> {
    const now = new Date();
    const note: Note = {
      id: randomUUID(),
      title: payload.title,
      content: payload.content,
      createdAt: now,
      updatedAt: now,
    };

    this.notes.set(note.id, note);
    return { ...note };
  }

  async findAll(): Promise<Note[]> {
    return Array.from(this.notes.values()).map((note) => ({ ...note }));
  }

  async findOne(id: string): Promise<Note> {
    const note = this.notes.get(id);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return { ...note };
  }

  async update(id: string, payload: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(id);

    const updated: Note = {
      ...note,
      ...payload,
      updatedAt: new Date(),
    };

    this.notes.set(id, updated);
    return { ...updated };
  }

  async remove(id: string): Promise<void> {
    if (!this.notes.delete(id)) {
      throw new NotFoundException('Note not found');
    }
  }
}
