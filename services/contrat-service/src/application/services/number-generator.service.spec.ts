import { Test, TestingModule } from '@nestjs/testing';
import { NumberGenerator } from './number-generator.service';

describe('NumberGenerator', () => {
  let service: NumberGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NumberGenerator],
    }).compile();

    service = module.get<NumberGenerator>(NumberGenerator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('nextCompteurNumber', () => {
    it('should generate correct compteur number format', () => {
      const result = service.nextCompteurNumber('TLS', '40', '723456');
      expect(result).toBe('M-TLS-40-0723456');
    });

    it('should pad serie number to 7 digits', () => {
      const result = service.nextCompteurNumber('TLS', '40', '123');
      expect(result).toBe('M-TLS-40-0000123');
    });
  });

  describe('validateContractNumber', () => {
    it('should validate correct contract number format', () => {
      expect(service.validateContractNumber('C-P-TLS-25-00432')).toBe(true);
      expect(service.validateContractNumber('C-I-PAR-24-00123')).toBe(true);
      expect(service.validateContractNumber('C-C-MAR-25-99999')).toBe(true);
    });

    it('should reject invalid contract number format', () => {
      expect(service.validateContractNumber('C-X-TLS-25-00432')).toBe(false); // Invalid type
      expect(service.validateContractNumber('C-P-TLS-25-432')).toBe(false);   // Short sequence
      expect(service.validateContractNumber('D-P-TLS-25-00432')).toBe(false); // Wrong prefix
    });
  });

  describe('validateCompteurNumber', () => {
    it('should validate correct compteur number format', () => {
      expect(service.validateCompteurNumber('M-TLS-40-0723456')).toBe(true);
      expect(service.validateCompteurNumber('M-PAR-25-0000001')).toBe(true);
    });

    it('should reject invalid compteur number format', () => {
      expect(service.validateCompteurNumber('M-TLS-40-723456')).toBe(false);  // Short serie
      expect(service.validateCompteurNumber('N-TLS-40-0723456')).toBe(false); // Wrong prefix
    });
  });

  describe('parseContractNumber', () => {
    it('should parse valid contract number', () => {
      const result = service.parseContractNumber('C-P-TLS-25-00432');
      expect(result).toEqual({
        type: 'P',
        zone: 'TLS',
        year: '25',
        seq: 432
      });
    });

    it('should return null for invalid contract number', () => {
      expect(service.parseContractNumber('C-X-TLS-25-00432')).toBeNull();
      expect(service.parseContractNumber('invalid')).toBeNull();
    });
  });
}); 