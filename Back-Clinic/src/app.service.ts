import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // Teste de permissões corrigidas - Workflow completo
    return 'Hello World! - Force Update - ' + new Date().toISOString();
  }
}
