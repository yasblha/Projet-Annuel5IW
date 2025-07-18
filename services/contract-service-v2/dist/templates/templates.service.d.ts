import { Sequelize } from 'sequelize-typescript';
import { CreateTemplateDto } from '../dto/create-template.dto';
export declare class TemplatesService {
    private sequelize;
    constructor(sequelize: Sequelize);
    create(createTemplateDto: CreateTemplateDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateTemplateDto: Partial<CreateTemplateDto>): Promise<any>;
    remove(id: string): Promise<void>;
    private formatTemplate;
}
