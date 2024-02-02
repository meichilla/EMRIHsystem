import { defineConfig, LoadStrategy } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';

import { DatabaseType } from 'src/common/types/database.type';

export default defineConfig({
  metadataProvider: TsMorphMetadataProvider,
  type: process.env.DB_TYPE as DatabaseType,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? +process.env.DB_PORT : undefined,
  dbName: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: ['./dist/entities/**/*.entity.js'],
  entitiesTs: ['./src/entities/**/*.entity.ts'],
  debug: process.env.NODE_ENV !== 'production' ? true : false,
  loadStrategy: LoadStrategy.JOINED,
  migrations: {
    path: './dist/database/migrations',
    pathTs: './src/database/migrations',
    fileName: (timestamp: string, name?: string) => {
      if (!name) {
        throw new Error(
          'Specify migration name via `mikro-orm migration:create --name=...`',
        );
      }

      return `Migration_${timestamp}_${name}`;
    },
  },
  seeder: {
    path: './dist/database/seeders',
    pathTs: './src/database/seeders',
  },
  extensions: [Migrator, SeedManager],
  discovery: {
    warnWhenNoEntities: false,
  },
});
