import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteContratUseCase {
  async execute(id: string): Promise<void> {
    return;
  }
} 