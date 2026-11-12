import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdNoteId: string | undefined;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'e2e-owner', password: 'password123' })
      .expect(201);

    accessToken = (registerResponse.body as { accessToken: string })
      .accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/auth/register (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'e2e-user', password: 'password123' })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('/auth/login (POST)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'e2e-login', password: 'password123' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'e2e-login', password: 'password123' })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('/notes (GET) rejects a request without a token', async () => {
    await request(app.getHttpServer()).get('/notes').expect(401);
  });

  it('/notes (POST) rejects a request without a token', async () => {
    await request(app.getHttpServer())
      .post('/notes')
      .send({ title: 'Anonymous note', content: 'Should not be stored' })
      .expect(401);
  });

  it('/notes (POST) creates a note for the authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'First note', content: 'Remember to test the API' })
      .expect(201);

    createdNoteId = (response.body as { id: string }).id;
    expect(response.body).toMatchObject({
      title: 'First note',
      content: 'Remember to test the API',
    });
  });

  it('/notes (GET) lists the authenticated user notes', async () => {
    const response = await request(app.getHttpServer())
      .get('/notes')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect((response.body as unknown[]).length).toBeGreaterThanOrEqual(1);
  });

  it('/notes/:id (GET) returns the note for its owner', async () => {
    if (!createdNoteId) {
      throw new Error('Expected note to be created in previous test');
    }

    const response = await request(app.getHttpServer())
      .get(`/notes/${createdNoteId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect((response.body as { id: string }).id).toBe(createdNoteId);
  });

  it('does not expose one user notes to another user', async () => {
    if (!createdNoteId) {
      throw new Error('Expected note to be created in previous test');
    }

    const otherUser = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'e2e-intruder', password: 'password123' })
      .expect(201);
    const otherToken = (otherUser.body as { accessToken: string }).accessToken;

    const list = await request(app.getHttpServer())
      .get('/notes')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200);
    expect(list.body).toHaveLength(0);

    await request(app.getHttpServer())
      .get(`/notes/${createdNoteId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/notes/${createdNoteId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);
  });

  it('/notes/:id (PATCH) updates the note for its owner', async () => {
    if (!createdNoteId) {
      throw new Error('Expected note to be created in previous test');
    }

    const response = await request(app.getHttpServer())
      .patch(`/notes/${createdNoteId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Updated note title' })
      .expect(200);

    expect((response.body as { title: string }).title).toBe(
      'Updated note title',
    );
  });

  it('/notes/:id (DELETE) deletes the note for its owner', async () => {
    if (!createdNoteId) {
      throw new Error('Expected note to be created in previous test');
    }

    await request(app.getHttpServer())
      .delete(`/notes/${createdNoteId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/notes/${createdNoteId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
