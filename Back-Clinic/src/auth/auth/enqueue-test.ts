/* eslint-disable prettier/prettier */
// enqueue-test.ts
import { Queue } from 'bullmq';
import { faker } from '@faker-js/faker';
import 'dotenv/config';

async function main() {
  const signUpQueue = new Queue('signUpQueue', {
    connection: { url: process.env.CACHE_REDIS_URI || 'redis://localhost:6379' }
  });

  for (let i = 0; i < 3000; i++) {
    const fakeData = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: '123456',
      cellPhone: '62986246249',
      type: 'O',
    };

    await signUpQueue.add('signUpJob', fakeData, {
      jobId: fakeData.email,
      attempts: 1,
    });

    console.log(`📦 Job ${i + 1} enfileirado: ${fakeData.email}`);
  }

  console.log('✅ Todos os 3000 jobs foram adicionados à fila!');
  await signUpQueue.close();
}

main().catch(console.error);
