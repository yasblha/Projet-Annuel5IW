import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkflowController } from './workflow/workflow.controller';
import { WorkflowService } from './workflow/workflow.service';
import { WorkflowEventListener } from './workflow/workflow.event-listener';
import { WorkflowDatabaseModule } from './infrastructure/database/database.module';
import { CatalogService } from './catalog/catalog.service';
import { CatalogController } from './catalog/catalog.controller';

@Module({
  imports: [WorkflowDatabaseModule],
  controllers: [AppController, WorkflowController, WorkflowEventListener, CatalogController],
  providers: [AppService, WorkflowService, CatalogService],
})
export class AppModule {}
