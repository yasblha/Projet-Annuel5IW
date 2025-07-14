import { Test, TestingModule } from '@nestjs/testing';
import { InterServiceService } from '../../src/application/services/inter-service.service';
import { Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

describe('InterServiceService', () => {
  let service: InterServiceService;
  let clientProxyMock: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    clientProxyMock = {
      send: jest.fn().mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({ id: 'test-id', compteurId: 'test-compteur-id' }),
      }),
      emit: jest.fn(),
      connect: jest.fn(),
      close: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterServiceService,
        {
          provide: 'AUTH_SERVICE',
          useValue: clientProxyMock,
        },
        {
          provide: 'COMPTEUR_SERVICE',
          useValue: clientProxyMock,
        },
        {
          provide: 'FACTURE_SERVICE',
          useValue: clientProxyMock,
        },
        {
          provide: 'INTERVENTION_SERVICE',
          useValue: clientProxyMock,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InterServiceService>(InterServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateVirtualMeter', () => {
    it('should generate a virtual meter with provided compteurId', async () => {
      // Arrange
      const meterData = { compteurId: 'A123456' };
      
      // Act
      const result = await service.generateVirtualMeter(meterData);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      expect(result.compteurId).toBe('test-compteur-id');
      expect(clientProxyMock.send).toHaveBeenCalledWith('create_meter', expect.objectContaining({
        compteurId: 'A123456'
      }));
    });

    it('should generate a virtual meter without compteurId', async () => {
      // Arrange
      const meterData = {};
      
      // Act
      const result = await service.generateVirtualMeter(meterData);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      expect(result.compteurId).toBe('test-compteur-id');
      expect(clientProxyMock.send).toHaveBeenCalledWith('create_meter', expect.any(Object));
    });
  });

  describe('updateClientInfo', () => {
    it('should update client info with RIB', async () => {
      // Arrange
      const clientId = 'client-123';
      const updateData = { rib: 'FR7630001007941234567890185' };
      
      // Act
      await service.updateClientInfo(clientId, updateData);
      
      // Assert
      expect(clientProxyMock.send).toHaveBeenCalledWith('update_client', expect.objectContaining({
        clientId,
        rib: 'FR7630001007941234567890185'
      }));
    });
  });

  describe('createIntervention', () => {
    it('should emit intervention creation event', async () => {
      // Arrange
      const interventionData = {
        contratId: 'contrat-123',
        type: 'INSTALLATION',
        datePrevisionnelle: new Date(),
      };
      
      // Act
      await service.createIntervention(interventionData);
      
      // Assert
      // Vérifier que emit est bien utilisé plutôt que send pour le fire-and-forget
      expect(clientProxyMock.emit).toHaveBeenCalledWith('create_intervention', expect.objectContaining({
        contratId: 'contrat-123',
        type: 'INSTALLATION'
      }));
    });
  });
});
