import { Module } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';

@Module({
  providers: [RolesGuard, Reflector],
  exports:   [RolesGuard, Reflector],
})
export class GuardsModule {}
