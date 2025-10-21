import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(username: string, passwordHash: string): Promise<User> {
    const user = this.usersRepository.create({
      username,
      passwordHash,
      refreshTokenHash: null,
    });

    return this.usersRepository.save(user);
  }

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async setRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void> {
    const updateResult = await this.usersRepository.update(userId, { refreshTokenHash });

    if (updateResult.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
