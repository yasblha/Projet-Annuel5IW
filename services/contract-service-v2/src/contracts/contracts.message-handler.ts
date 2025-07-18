import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from '../dto/create-contract.dto';
import { ValidateContractDto } from '../dto/validate-contract.dto';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class ContractsMessageHandler {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly jwtService: JwtService,
  ) {}

  private extractAgencyId(token: string): string {
    try {
      const payload = this.jwtService.decode(token);
      return payload['agencyId'];
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  @MessagePattern('contracts.create')
  async create(@Payload() data: { createContractDto: CreateContractDto }) {
    try {
      const { createContractDto } = data;
      
      if (!createContractDto.token) {
        throw new Error('Token is required');
      }
      
      const agencyId = this.extractAgencyId(createContractDto.token);
      
      const contract = await this.contractsService.create(agencyId, createContractDto);
      
      return {
        status: 'success',
        data: contract,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };
    }
  }

  @MessagePattern('contracts.list')
  async findAll(@Payload() data: { token: string; filters?: any }) {
    try {
      const { token, filters } = data;
      
      if (!token) {
        throw new Error('Token is required');
      }
      
      const agencyId = this.extractAgencyId(token);
      
      const contracts = await this.contractsService.findAll(agencyId, filters);
      
      return {
        status: 'success',
        data: contracts,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };
    }
  }

  @MessagePattern('contracts.getById')
  async findOne(@Payload() data: { id: string; token: string }) {
    try {
      const { id, token } = data;
      
      if (!token) {
        throw new Error('Token is required');
      }
      
      const agencyId = this.extractAgencyId(token);
      
      const contract = await this.contractsService.findOne(id, agencyId);
      
      return {
        status: 'success',
        data: contract,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };
    }
  }

  @MessagePattern('contracts.validate')
  async validate(@Payload() data: { id: string; validateContractDto: ValidateContractDto }) {
    try {
      const { id, validateContractDto } = data;
      
      if (!validateContractDto.token) {
        throw new Error('Token is required');
      }
      
      const agencyId = this.extractAgencyId(validateContractDto.token);
      
      const contract = await this.contractsService.validate(id, agencyId);
      
      return {
        status: 'success',
        data: contract,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };
    }
  }

  @MessagePattern('contracts.sign')
  async sign(@Payload() data: { id: string; token: string }) {
    try {
      const { id, token } = data;
      
      if (!token) {
        throw new Error('Token is required');
      }
      
      const agencyId = this.extractAgencyId(token);
      
      const contract = await this.contractsService.sign(id, agencyId);
      
      return {
        status: 'success',
        data: contract,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };
    }
  }

  @MessagePattern('contracts.terminate')
  async terminate(@Payload() data: { id: string; token: string; reason?: string }) {
    try {
      const { id, token, reason } = data;
      
      if (!token) {
        throw new Error('Token is required');
      }
      
      const agencyId = this.extractAgencyId(token);
      
      const contract = await this.contractsService.terminate(id, agencyId, reason);
      
      return {
        status: 'success',
        data: contract,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };
    }
  }

  @MessagePattern('contracts.updateMeter')
  async updateMeter(@Payload() data: { contractId: string; meterId: string }) {
    try {
      const { contractId, meterId } = data;
      
      const contract = await this.contractsService.updateMeter(contractId, meterId);
      
      return {
        status: 'success',
        data: contract,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };
    }
  }
}
