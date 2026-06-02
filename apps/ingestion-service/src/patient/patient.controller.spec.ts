import { Test, TestingModule } from '@nestjs/testing';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './create-patient.dto';
import { NotFoundException } from '@nestjs/common';

type MockPatientService = {
  create: jest.Mock<Promise<any>, [CreatePatientDto, string, string]>;
  findAll: jest.Mock<Promise<any[]>, [string, string]>;
  findOne: jest.Mock<Promise<any>, [string]>;
  update: jest.Mock<Promise<any>, [string, Partial<CreatePatientDto>]>;
  remove: jest.Mock<Promise<any>, [string]>;
};

describe('PatientController', () => {
  let controller: PatientController;

  const mockPatient = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male',
    birthDate: new Date('1990-01-01'),
    practitionerId: 'practitioner-1',
  };

  const mockUser = { userId: 'user-123', role: 'ADMIN' };

  const mockPatientService: MockPatientService = {
    create: jest.fn() as jest.Mock<
      Promise<any>,
      [CreatePatientDto, string, string]
    >,
    findAll: jest.fn() as jest.Mock<Promise<any[]>, [string, string]>,
    findOne: jest.fn() as jest.Mock<Promise<any>, [string]>,
    update: jest.fn() as jest.Mock<
      Promise<any>,
      [string, Partial<CreatePatientDto>]
    >,
    remove: jest.fn() as jest.Mock<Promise<any>, [string]>,
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

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a patient', async () => {
      const createPatientDto: CreatePatientDto = {
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1990-01-01',
        gender: 'male',
      };

      mockPatientService.create.mockResolvedValue(mockPatient);

      const result = await controller.create(createPatientDto, mockUser);

      expect(mockPatientService.create).toHaveBeenCalledWith(
        createPatientDto,
        mockUser.userId,
        mockUser.role,
      );
      expect(result).toEqual(mockPatient);
    });
  });

  describe('findAll', () => {
    it('should return an array of patients', async () => {
      const patients = [mockPatient, { ...mockPatient, id: '456' }];
      mockPatientService.findAll.mockResolvedValue(patients);

      const result = await controller.findAll(mockUser);

      expect(mockPatientService.findAll).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
      );
      expect(result).toEqual(patients);
    });
  });

  describe('findOne', () => {
    it('should return a patient by id', async () => {
      mockPatientService.findOne.mockResolvedValue(mockPatient);

      const result = await controller.findOne('123');

      expect(mockPatientService.findOne).toHaveBeenCalledWith('123');
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

      expect(mockPatientService.update).toHaveBeenCalledWith(
        '123',
        updatePatientDto,
      );
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

      expect(mockPatientService.remove).toHaveBeenCalledWith('123');
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
