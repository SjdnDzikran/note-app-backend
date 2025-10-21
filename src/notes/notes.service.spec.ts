import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './note.entity';
import { NotesService } from './notes.service';

describe('NotesService', () => {
  let service: NotesService;
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
      providers: [NotesService],
    }).compile();

    service = moduleRef.get<NotesService>(NotesService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('creates and retrieves a note', async () => {
    const payload: CreateNoteDto = { title: 'Test', content: 'Example' };
    const created = await service.create(payload);

    expect(created).toMatchObject({
      title: payload.title,
      content: payload.content,
    });
    expect(created.id).toEqual(expect.any(String));

    const fetched = await service.findOne(created.id);
    expect(fetched).toMatchObject({ id: created.id });
  });

  it('updates an existing note', async () => {
    const created = await service.create({ title: 'Original', content: 'Initial' });

    const updated = await service.update(created.id, { title: 'Updated' });

    expect(updated.title).toBe('Updated');
    expect(updated.content).toBe('Initial');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
  });

  it('removes an existing note', async () => {
    const created = await service.create({ title: 'To delete', content: 'Bye' });

    await expect(service.remove(created.id)).resolves.toBeUndefined();
    await expect(service.findOne(created.id)).rejects.toThrow('Note not found');
  });
});
