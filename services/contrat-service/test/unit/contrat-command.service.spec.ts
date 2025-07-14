import { Test, TestingModule } from '@nestjs/testing';
import { ContratCommandService } from '../../src/application/services/contrat-command.service';
import { InterServiceService } from '../../src/application/services/inter-service.service';
import { NotificationService } from '../../src/application/services/notification.service';
import { Logger } from '@nestjs/common';

describe('ContratCommandService', () => {
  let service: ContratCommandService;
  let interServiceService: InterServiceService;
  let notificationService: NotificationService;

  const mockSequelizeProvider = {
    models: {
      Contrat: {
        create: jest.fn().mockImplementation((data) => Promise.resolve({
          id: 'test-contrat-id',
          ...data,
        })),
        findOne: jest.fn().mockImplementation(() => Promise.resolve(null)),
      },
    },
  };

  const mockInterServiceService = {
    generateVirtualMeter: jest.fn().mockImplementation((meter) => Promise.resolve({
      id: 'generated-meter-id',
      compteurId: meter.compteurId || 'auto-generated-id',
    })),
    updateClientInfo: jest.fn().mockImplementation(() => Promise.resolve({ success: true })),
    createIntervention: jest.fn().mockImplementation(() => Promise.resolve({ success: true })),
  };

  const mockNotificationService = {
    notifyContratCreated: jest.fn().mockImplementation(() => Promise.resolve()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContratCommandService,
        {
          provide: 'SEQUELIZE',
          useValue: mockSequelizeProvider,
        },
        {
          provide: InterServiceService,
          useValue: mockInterServiceService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
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

    service = module.get<ContratCommandService>(ContratCommandService);
    interServiceService = module.get<InterServiceService>(InterServiceService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a contract', async () => {
      // Arrange
      const mockContratData = {
        clientId: 'client-123',
        adresseId: 'adresse-123',
        formulaId: 'formula-123',
        statut: 'BROUILLON',
        dateDebut: new Date(),
        tenantId: 'tenant-123',
      };

      // Act
      const result = await service.create(mockContratData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('test-contrat-id');
      expect(mockSequelizeProvider.models.Contrat.create).toHaveBeenCalledWith(expect.objectContaining({
        clientId: mockContratData.clientId,
        adresseId: mockContratData.adresseId,
        formulaId: mockContratData.formulaId,
      }));
      expect(notificationService.notifyContratCreated).toHaveBeenCalled();
    });

    it('should handle physical meter creation for non-UUID meter ID', async () => {
      // Arrange
      const mockContratData = {
        clientId: 'client-123',
        adresseId: 'adresse-123',
        formulaId: 'formula-123',
        statut: 'BROUILLON',
        dateDebut: new Date(),
        tenantId: 'tenant-123',
        meter: {
          compteurId: 'A123456', // Non-UUID format meter ID
        },
      };

      // Act
      const result = await service.create(mockContratData);

      // Assert
      expect(result).toBeDefined();
      expect(interServiceService.generateVirtualMeter).toHaveBeenCalledWith(
        expect.objectContaining({ compteurId: 'A123456' })
      );
      expect(mockSequelizeProvider.models.Contrat.create).toHaveBeenCalledWith(
        expect.objectContaining({ compteurId: 'generated-meter-id' })
      );
    });

    it('should handle payment information update', async () => {
      // Arrange
      const mockContratData = {
        clientId: 'client-123',
        adresseId: 'adresse-123',
        formulaId: 'formula-123',
        statut: 'BROUILLON',
        dateDebut: new Date(),
        tenantId: 'tenant-123',
        payment: {
          rib: 'FR7630001007941234567890185',
        },
      };

      // Act
      const result = await service.create(mockContratData);

      // Assert
      expect(result).toBeDefined();
      expect(interServiceService.updateClientInfo).toHaveBeenCalledWith(
        'client-123',
        expect.objectContaining({ rib: 'FR7630001007941234567890185' })
      );
    });
  });
});
