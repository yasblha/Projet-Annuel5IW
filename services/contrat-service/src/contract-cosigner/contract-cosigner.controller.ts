import { ContractCosignerDto } from './../../../../application/dtos/contractCosigner.dto';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { Controller, Post, Body, Get } from '@nestjs/common';
import { ContractCosignersService } from './contract-cosigner.service';

@ApiTags('contract-cosigner')
@Controller('contract-cosigner')
export class ContractCosignerController {
    constructor(private readonly contractCosignerService: ContractCosignersService) {}

    @Get('')
    getAll() {
        return this.contractCosignerService.getAll();
    }

    @Post('')
    @ApiBody({ type: ContractCosignerDto })
    createContractCosigner(@Body() dto: ContractCosignerDto) {
        return this.contractCosignerService.create(dto);
    }

    @Get(':id')
    getByContractId(@Body('id') id: string) {
        return this.contractCosignerService.getById(id);
    }

    @Post(':id')
    @ApiBody({ type: ContractCosignerDto })
    updateContractCosigner(@Body('id') id: string, @Body() updates: Partial<ContractCosignerDto>) {
        return this.contractCosignerService.update(id, updates);
    }

    @Post('delete/:id')
    deleteContractCosigner(@Body('id') id: string) {
        return this.contractCosignerService.delete(id);
    }   
}
