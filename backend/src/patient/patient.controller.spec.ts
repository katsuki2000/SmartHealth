import { Test, TestingModule } from '@nestjs/testing';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './create-patient.dto';
import { NotFoundException } from '@nestjs/common';

describe('PatientController', () => {
  let controller: PatientController;
  let patientService: PatientService;

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

  const mockPatientService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientController],
      providers: [
        {
          provide: PatientService,
          useValue: mockPatientService,
        },
      ],
    }).compile();

    controller = module.get<PatientController>(PatientController);
    patientService = module.get<PatientService>(PatientService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a patient', async () => {
      const createPatientDto: CreatePatientDto = {
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

      mockPatientService.create.mockResolvedValue(mockPatient);

      const result = await controller.create(createPatientDto);

      expect(patientService.create).toHaveBeenCalledWith(createPatientDto);
      expect(result).toEqual(mockPatient);
    });
  });

  describe('findAll', () => {
    it('should return an array of patients', async () => {
      const patients = [mockPatient, { ...mockPatient, id: '456' }];
      mockPatientService.findAll.mockResolvedValue(patients);

      const result = await controller.findAll();

      expect(patientService.findAll).toHaveBeenCalled();
      expect(result).toEqual(patients);
    });
  });

  describe('findOne', () => {
    it('should return a patient by id', async () => {
      mockPatientService.findOne.mockResolvedValue(mockPatient);

      const result = await controller.findOne('123');

      expect(patientService.findOne).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockPatient);
    });

    it('should throw NotFoundException when patient not found', async () => {
      mockPatientService.findOne.mockRejectedValue(
        new NotFoundException('Patient not found'),
      );

      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const updatePatientDto: Partial<CreatePatientDto> = {
        firstName: 'Jane',
      };
      const updatedPatient = { ...mockPatient, firstName: 'Jane' };

      mockPatientService.update.mockResolvedValue(updatedPatient);

      const result = await controller.update('123', updatePatientDto);

      expect(patientService.update).toHaveBeenCalledWith('123', updatePatientDto);
      expect(result).toEqual(updatedPatient);
    });

    it('should throw NotFoundException when patient not found', async () => {
      mockPatientService.update.mockRejectedValue(
        new NotFoundException('Patient not found'),
      );

      await expect(
        controller.update('nonexistent', { firstName: 'Jane' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a patient', async () => {
      mockPatientService.remove.mockResolvedValue(mockPatient);

      const result = await controller.remove('123');

      expect(patientService.remove).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockPatient);
    });

    it('should throw NotFoundException when patient not found', async () => {
      mockPatientService.remove.mockRejectedValue(
        new NotFoundException('Patient not found'),
      );

      await expect(controller.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
