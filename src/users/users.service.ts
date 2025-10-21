import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { User } from './user.entity';

@Injectable()
export class UsersService {
  private readonly users = new Map<string, User>();

  async createUser(username: string, passwordHash: string): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username,
      passwordHash,
      refreshTokenHash: null,
    };

    this.users.set(id, user);
    return { ...user };
  }

  async findByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return { ...user };
      }
    }

    return undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    return user ? { ...user } : undefined;
  }

  async setRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void> {
    const user = this.users.get(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.refreshTokenHash = refreshTokenHash;
  }
}
