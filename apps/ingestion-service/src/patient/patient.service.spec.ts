import { Test, TestingModule } from '@nestjs/testing';
import { PatientService } from './patient.service';
import { PrismaService } from '../prisma/prisma.service';
import { FhirService } from '../fhir/fhir.service';
import { NotFoundException } from '@nestjs/common';

describe('PatientService', () => {
  let service: PatientService;
  let prismaService: PrismaService;
  let fhirService: FhirService;

  const mockPatient = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    birthDate: new Date('1990-01-01'),
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
  };

  const mockPrismaService = {
    patient: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockFhirService = {
    syncPatient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: FhirService,
          useValue: mockFhirService,
        },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    prismaService = module.get<PrismaService>(PrismaService);
    fhirService = module.get<FhirService>(FhirService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new patient', async () => {
      const createPatientDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        birthDate: '1990-01-01',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      };

      mockPrismaService.patient.create.mockResolvedValue(mockPatient);
      mockFhirService.syncPatient.mockResolvedValue({});

      const result = await service.create(createPatientDto);

      expect(mockPrismaService.patient.create).toHaveBeenCalledWith({
        data: {
          ...createPatientDto,
          birthDate: new Date(createPatientDto.birthDate),
        },
      });
      expect(mockFhirService.syncPatient).toHaveBeenCalledWith(mockPatient);
      expect(result).toEqual(mockPatient);
    });

    it('should handle FHIR sync errors gracefully', async () => {
      const createPatientDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        birthDate: '1990-01-01',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      };

      mockPrismaService.patient.create.mockResolvedValue(mockPatient);
      mockFhirService.syncPatient.mockRejectedValue(new Error('FHIR sync failed'));

      const result = await service.create(createPatientDto);

      expect(result).toEqual(mockPatient);
    });
  });

  describe('findAll', () => {
    it('should return all patients', async () => {
      const patients = [mockPatient, { ...mockPatient, id: '456' }];
      mockPrismaService.patient.findMany.mockResolvedValue(patients);

      const result = await service.findAll();

      expect(mockPrismaService.patient.findMany).toHaveBeenCalled();
      expect(result).toEqual(patients);
    });

    it('should return empty array when no patients exist', async () => {
      mockPrismaService.patient.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a patient by id', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(mockPatient);

      const result = await service.findOne('123');

      expect(mockPrismaService.patient.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(result).toEqual(mockPatient);
    });

    it('should throw NotFoundException when patient not found', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const updateData = { firstName: 'Jane' };
      const updatedPatient = { ...mockPatient, ...updateData };

      mockPrismaService.patient.update.mockResolvedValue(updatedPatient);

      const result = await service.update('123', updateData);

      expect(mockPrismaService.patient.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: updateData,
      });
      expect(result).toEqual(updatedPatient);
    });

    it('should convert birthDate to Date object when updating', async () => {
      const updateData = { birthDate: '1995-06-15' };
      const updatedPatient = {
        ...mockPatient,
        birthDate: new Date(updateData.birthDate),
      };

      mockPrismaService.patient.update.mockResolvedValue(updatedPatient);

      await service.update('123', updateData);

      expect(mockPrismaService.patient.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          birthDate: new Date(updateData.birthDate),
        },
      });
    });

    it('should throw NotFoundException when patient not found', async () => {
      mockPrismaService.patient.update.mockRejectedValue(new Error('Not found'));

      await expect(service.update('nonexistent', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a patient', async () => {
      mockPrismaService.patient.delete.mockResolvedValue(mockPatient);

      const result = await service.remove('123');

      expect(mockPrismaService.patient.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(result).toEqual(mockPatient);
    });

    it('should throw NotFoundException when patient not found', async () => {
      mockPrismaService.patient.delete.mockRejectedValue(new Error('Not found'));

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
