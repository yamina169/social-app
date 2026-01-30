import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppDataSource } from './ormconfig';

@Injectable()
export class DatabaseService implements OnModuleInit {
  async onModuleInit() {
    try {
      await AppDataSource.initialize();
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection failed', error);
    }
  }
}
