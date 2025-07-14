import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  // Definition du graphe (nodes / edges) au format JSON { nodes: [], edges: [] }
  @IsObject()
  definition!: any;
}
