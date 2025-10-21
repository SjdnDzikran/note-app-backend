import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

describe('AppController (e2e)', () => {
  let app: INestApplication;
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    await request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
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

  it('/notes (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/notes')
      .send({ title: 'First note', content: 'Remember to test the API' })
      .expect(201);

    createdNoteId = response.body.id;
    expect(response.body).toMatchObject({
      title: 'First note',
      content: 'Remember to test the API',
    });
  });

  it('/notes (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/notes').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('/notes/:id (GET)', async () => {
    if (!createdNoteId) {
      throw new Error('Expected note to be created in previous test');
    }

    const response = await request(app.getHttpServer()).get(`/notes/${createdNoteId}`).expect(200);

    expect(response.body.id).toBe(createdNoteId);
  });

  it('/notes/:id (PATCH)', async () => {
    if (!createdNoteId) {
      throw new Error('Expected note to be created in previous test');
    }

    const response = await request(app.getHttpServer())
      .patch(`/notes/${createdNoteId}`)
      .send({ title: 'Updated note title' })
      .expect(200);

    expect(response.body.title).toBe('Updated note title');
  });

  it('/notes/:id (DELETE)', async () => {
    if (!createdNoteId) {
      throw new Error('Expected note to be created in previous test');
    }

    await request(app.getHttpServer()).delete(`/notes/${createdNoteId}`).expect(204);

    await request(app.getHttpServer()).get(`/notes/${createdNoteId}`).expect(404);
  });
});
