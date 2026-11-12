import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './note.entity';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

const OWNER_ID = '11111111-1111-1111-1111-111111111111';

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
        JwtModule.register({ secret: 'test-secret' }),
      ],
      controllers: [NotesController],
      providers: [NotesService, JwtAuthGuard],
    }).compile();

    controller = moduleRef.get<NotesController>(NotesController);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('creates and returns a note', async () => {
    const payload: CreateNoteDto = {
      title: 'Controller note',
      content: 'Content',
    };
    const note = await controller.create(payload, {
      id: OWNER_ID,
      username: 'owner',
    });

    expect(note.id).toEqual(expect.any(String));
    expect(note.title).toBe(payload.title);
  });

  it('lists and updates notes', async () => {
    const user = { id: OWNER_ID, username: 'owner' };
    const created = await controller.create(
      { title: 'Original', content: 'Body' },
      user,
    );

    const list = await controller.findAll(user);
    expect(list).toHaveLength(1);

    const updatePayload: UpdateNoteDto = { content: 'Updated body' };
    const updated = await controller.update(created.id, updatePayload, user);
    expect(updated.content).toBe('Updated body');

    await controller.remove(created.id, user);
    await expect(controller.findOne(created.id, user)).rejects.toThrow(
      'Note not found',
    );
  });
});
