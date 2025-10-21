import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './note.entity';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

describe('NotesController', () => {
  let controller: NotesController;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Note],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Note]),
      ],
      controllers: [NotesController],
      providers: [NotesService],
    }).compile();

    controller = moduleRef.get<NotesController>(NotesController);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('creates and returns a note', async () => {
    const payload: CreateNoteDto = { title: 'Controller note', content: 'Content' };
    const note = await controller.create(payload);

    expect(note.id).toEqual(expect.any(String));
    expect(note.title).toBe(payload.title);
  });

  it('lists and updates notes', async () => {
    const created = await controller.create({ title: 'Original', content: 'Body' });

    const list = await controller.findAll();
    expect(list).toHaveLength(1);

    const updatePayload: UpdateNoteDto = { content: 'Updated body' };
    const updated = await controller.update(created.id, updatePayload);
    expect(updated.content).toBe('Updated body');

    await controller.remove(created.id);
    await expect(controller.findOne(created.id)).rejects.toThrow('Note not found');
  });
});
