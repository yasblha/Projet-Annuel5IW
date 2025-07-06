import { ContratDto } from './../../../../application/dtos/contract.dto';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { Controller, Post, Body, Get } from '@nestjs/common';
import { ContractsService } from "./contract.service";

@ApiTags('contract')
@Controller('contract')
export class ContractController {
    constructor(private readonly contractService: ContractsService) {}

    @Get('')
    getAll() {
        return this.contractService.getAll();
    }

    @Post('')
    @ApiBody({ type: ContratDto })
    createContract(@Body() dto: ContratDto) {
        return this.contractService.create(dto);
    }

    @Get(':id')
    getByContractId(@Body('id') id: string) {
        return this.contractService.getById(id);
    }

    @Post(':id')
    @ApiBody({ type: ContratDto })
    updateContract(@Body('id') id: string, @Body() updates: Partial<ContratDto>) {
        return this.contractService.update(id, updates);
    }

    @Post('delete/:id')
    deleteContract(@Body('id') id: string) {
        return this.contractService.delete(id);
    }
}
