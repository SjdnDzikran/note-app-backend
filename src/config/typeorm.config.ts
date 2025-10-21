import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    const isTestEnv = configService.get<string>('NODE_ENV') === 'test';
    const baseOptions: Pick<TypeOrmModuleOptions, 'entities' | 'synchronize'> = {
      entities: [User, Note],
      synchronize: true,
    };

    if (isTestEnv) {
      return {
        type: 'sqlite',
        database: ':memory:',
        dropSchema: true,
        ...baseOptions,
      };
    }

    const databaseUrl = configService.get<string>('DATABASE_URL');
    if (databaseUrl) {
      return {
        type: 'postgres',
        url: databaseUrl,
        autoLoadEntities: true,
        ...baseOptions,
      };
    }

    return {
      type: 'postgres',
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
      username: configService.get<string>('DB_USERNAME', 'postgres'),
      password: configService.get<string>('DB_PASSWORD', 'postgres'),
      database: configService.get<string>('DB_NAME', 'note_app'),
      autoLoadEntities: true,
      ...baseOptions,
    };
  },
  inject: [ConfigService],
};
