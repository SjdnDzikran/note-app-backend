import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './note.entity';
import { NotesService } from './notes.service';

const OWNER_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_USER_ID = '22222222-2222-2222-2222-222222222222';

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
    const created = await service.create(payload, OWNER_ID);

    expect(created).toMatchObject({
      title: payload.title,
      content: payload.content,
      ownerId: OWNER_ID,
    });
    expect(created.id).toEqual(expect.any(String));

    const fetched = await service.findOne(created.id, OWNER_ID);
    expect(fetched).toMatchObject({ id: created.id });
  });

  it('updates an existing note', async () => {
    const created = await service.create(
      { title: 'Original', content: 'Initial' },
      OWNER_ID,
    );

    const updated = await service.update(created.id, OWNER_ID, {
      title: 'Updated',
    });

    expect(updated.title).toBe('Updated');
    expect(updated.content).toBe('Initial');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      created.updatedAt.getTime(),
    );
  });

  it('removes an existing note', async () => {
    const created = await service.create(
      { title: 'To delete', content: 'Bye' },
      OWNER_ID,
    );

    await expect(service.remove(created.id, OWNER_ID)).resolves.toBeUndefined();
    await expect(service.findOne(created.id, OWNER_ID)).rejects.toThrow(
      'Note not found',
    );
  });

  it('only returns and mutates notes owned by the caller', async () => {
    const created = await service.create(
      { title: 'Private', content: 'Secret' },
      OWNER_ID,
    );

    await expect(service.findAll(OTHER_USER_ID)).resolves.toHaveLength(0);
    await expect(service.findOne(created.id, OTHER_USER_ID)).rejects.toThrow(
      'Note not found',
    );
    await expect(
      service.update(created.id, OTHER_USER_ID, { title: 'Hijacked' }),
    ).rejects.toThrow('Note not found');
    await expect(service.remove(created.id, OTHER_USER_ID)).rejects.toThrow(
      'Note not found',
    );
  });
});
