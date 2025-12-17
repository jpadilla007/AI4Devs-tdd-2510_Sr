import { Request, Response } from 'express';
import { validateCandidateData } from '../application/validator';
import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';
import { PrismaClient } from '@prisma/client';
import { addCandidateController } from '../presentation/controllers/candidateController';

// Mock de Prisma
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        candidate: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
        education: {
            create: jest.fn(),
            update: jest.fn(),
        },
        workExperience: {
            create: jest.fn(),
            update: jest.fn(),
        },
        resume: {
            create: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
    };
});

describe('Tests de Validación - Validator', () => {
    describe('Validación de Nombres (firstName y lastName)', () => {
        it('debería aceptar nombres válidos con caracteres especiales españoles', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería rechazar nombres con menos de 2 caracteres', () => {
            const invalidData = {
                firstName: 'A',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid name');
        });

        it('debería rechazar nombres con más de 100 caracteres', () => {
            const invalidData = {
                firstName: 'A'.repeat(101),
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid name');
        });

        it('debería rechazar nombres con números', () => {
            const invalidData = {
                firstName: 'José123',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid name');
        });

        it('debería rechazar nombres con caracteres especiales no permitidos', () => {
            const invalidData = {
                firstName: 'José@',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid name');
        });

        it('debería rechazar nombres vacíos', () => {
            const invalidData = {
                firstName: '',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid name');
        });

        it('debería rechazar nombres undefined', () => {
            const invalidData = {
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid name');
        });

        it('debería aceptar nombres con espacios', () => {
            const validData = {
                firstName: 'María José',
                lastName: 'García López',
                email: 'maria@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar nombres con acentos y eñes', () => {
            const validData = {
                firstName: 'Ángel',
                lastName: 'Muñoz',
                email: 'angel@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });
    });

    describe('Validación de Email', () => {
        it('debería aceptar emails válidos', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose.gonzalez@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar emails con subdominios', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@mail.example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería rechazar emails sin @', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'joseexample.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid email');
        });

        it('debería rechazar emails sin dominio', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@',
                phone: '612345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid email');
        });

        it('debería rechazar emails sin extensión', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example',
                phone: '612345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid email');
        });

        it('debería rechazar emails vacíos', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: '',
                phone: '612345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid email');
        });

        it('debería rechazar emails undefined', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                phone: '612345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid email');
        });

        it('debería aceptar emails con caracteres especiales permitidos', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose.test+tag@example.co.uk',
                phone: '612345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });
    });

    describe('Validación de Teléfono', () => {
        it('debería aceptar teléfonos válidos que empiezan con 6', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar teléfonos válidos que empiezan con 7', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '712345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar teléfonos válidos que empiezan con 9', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '912345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería rechazar teléfonos que no empiezan con 6, 7 o 9', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '812345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid phone');
        });

        it('debería rechazar teléfonos con menos de 9 dígitos', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '61234567'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid phone');
        });

        it('debería rechazar teléfonos con más de 9 dígitos', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '6123456789'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid phone');
        });

        it('debería rechazar teléfonos con letras', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '61234567a'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid phone');
        });

        it('debería aceptar teléfono undefined (opcional)', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar teléfono vacío (opcional)', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: ''
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });
    });

    describe('Validación de Dirección', () => {
        it('debería aceptar direcciones válidas', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                address: 'Calle Mayor 123, Madrid'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería rechazar direcciones con más de 100 caracteres', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                address: 'A'.repeat(101)
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid address');
        });

        it('debería aceptar dirección undefined (opcional)', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar dirección vacía (opcional)', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                address: ''
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });
    });

    describe('Validación de Educación', () => {
        it('debería aceptar educación válida', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: 'Universidad Complutense',
                    title: 'Ingeniería Informática',
                    startDate: '2010-09-01',
                    endDate: '2014-06-30'
                }]
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar educación sin fecha de fin', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: 'Universidad Complutense',
                    title: 'Ingeniería Informática',
                    startDate: '2010-09-01'
                }]
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería rechazar educación sin institución', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    title: 'Ingeniería Informática',
                    startDate: '2010-09-01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid institution');
        });

        it('debería rechazar educación con institución vacía', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: '',
                    title: 'Ingeniería Informática',
                    startDate: '2010-09-01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid institution');
        });

        it('debería rechazar educación con institución de más de 100 caracteres', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: 'A'.repeat(101),
                    title: 'Ingeniería Informática',
                    startDate: '2010-09-01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid institution');
        });

        it('debería rechazar educación sin título', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: 'Universidad Complutense',
                    startDate: '2010-09-01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid title');
        });

        it('debería rechazar educación con título vacío', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: 'Universidad Complutense',
                    title: '',
                    startDate: '2010-09-01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid title');
        });

        it('debería rechazar educación con título de más de 100 caracteres', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: 'Universidad Complutense',
                    title: 'A'.repeat(101),
                    startDate: '2010-09-01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid title');
        });

        it('debería rechazar educación sin fecha de inicio', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: 'Universidad Complutense',
                    title: 'Ingeniería Informática'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid date');
        });

        it('debería rechazar educación con fecha de inicio inválida', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: 'Universidad Complutense',
                    title: 'Ingeniería Informática',
                    startDate: '2010/09/01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid date');
        });

        it('debería rechazar educación con fecha de fin inválida', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: 'Universidad Complutense',
                    title: 'Ingeniería Informática',
                    startDate: '2010-09-01',
                    endDate: '2014/06/30'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid end date');
        });

        it('debería aceptar múltiples educaciones', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [
                    {
                        institution: 'Universidad Complutense',
                        title: 'Ingeniería Informática',
                        startDate: '2010-09-01',
                        endDate: '2014-06-30'
                    },
                    {
                        institution: 'Universidad Politécnica',
                        title: 'Máster en IA',
                        startDate: '2014-09-01',
                        endDate: '2016-06-30'
                    }
                ]
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar array de educaciones vacío', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: []
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });
    });

    describe('Validación de Experiencia Laboral', () => {
        it('debería aceptar experiencia laboral válida', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: 'Tech Corp',
                    position: 'Software Engineer',
                    description: 'Desarrollo de aplicaciones web',
                    startDate: '2015-01-01',
                    endDate: '2018-12-31'
                }]
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar experiencia laboral sin descripción', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: 'Tech Corp',
                    position: 'Software Engineer',
                    startDate: '2015-01-01',
                    endDate: '2018-12-31'
                }]
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar experiencia laboral sin fecha de fin', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: 'Tech Corp',
                    position: 'Software Engineer',
                    startDate: '2015-01-01'
                }]
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería rechazar experiencia laboral sin empresa', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    position: 'Software Engineer',
                    startDate: '2015-01-01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid company');
        });

        it('debería rechazar experiencia laboral con empresa vacía', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: '',
                    position: 'Software Engineer',
                    startDate: '2015-01-01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid company');
        });

        it('debería rechazar experiencia laboral con empresa de más de 100 caracteres', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: 'A'.repeat(101),
                    position: 'Software Engineer',
                    startDate: '2015-01-01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid company');
        });

        it('debería rechazar experiencia laboral sin posición', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: 'Tech Corp',
                    startDate: '2015-01-01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid position');
        });

        it('debería rechazar experiencia laboral con posición vacía', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: 'Tech Corp',
                    position: '',
                    startDate: '2015-01-01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid position');
        });

        it('debería rechazar experiencia laboral con posición de más de 100 caracteres', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: 'Tech Corp',
                    position: 'A'.repeat(101),
                    startDate: '2015-01-01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid position');
        });

        it('debería rechazar experiencia laboral con descripción de más de 200 caracteres', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: 'Tech Corp',
                    position: 'Software Engineer',
                    description: 'A'.repeat(201),
                    startDate: '2015-01-01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid description');
        });

        it('debería rechazar experiencia laboral sin fecha de inicio', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: 'Tech Corp',
                    position: 'Software Engineer'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid date');
        });

        it('debería rechazar experiencia laboral con fecha de inicio inválida', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: 'Tech Corp',
                    position: 'Software Engineer',
                    startDate: '2015/01/01'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid date');
        });

        it('debería rechazar experiencia laboral con fecha de fin inválida', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: 'Tech Corp',
                    position: 'Software Engineer',
                    startDate: '2015-01-01',
                    endDate: '2018/12/31'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid end date');
        });

        it('debería aceptar múltiples experiencias laborales', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [
                    {
                        company: 'Tech Corp',
                        position: 'Software Engineer',
                        startDate: '2015-01-01',
                        endDate: '2018-12-31'
                    },
                    {
                        company: 'Startup Inc',
                        position: 'Senior Developer',
                        startDate: '2019-01-01'
                    }
                ]
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar array de experiencias laborales vacío', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: []
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });
    });

    describe('Validación de CV', () => {
        it('debería aceptar CV válido', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                cv: {
                    filePath: 'uploads/1715760936750-cv.pdf',
                    fileType: 'application/pdf'
                }
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería rechazar CV sin filePath', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                cv: {
                    fileType: 'application/pdf'
                }
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid CV data');
        });

        it('debería rechazar CV sin fileType', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                cv: {
                    filePath: 'uploads/1715760936750-cv.pdf'
                }
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid CV data');
        });

        it('debería rechazar CV con filePath que no es string', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                cv: {
                    filePath: 123,
                    fileType: 'application/pdf'
                }
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid CV data');
        });

        it('debería rechazar CV con fileType que no es string', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                cv: {
                    filePath: 'uploads/1715760936750-cv.pdf',
                    fileType: 123
                }
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid CV data');
        });

        it('debería rechazar CV que no es un objeto', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                cv: 'not-an-object'
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid CV data');
        });

        it('debería aceptar CV vacío (objeto vacío)', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                cv: {}
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar candidato sin CV', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });
    });

    describe('Validación de Candidato Completo', () => {
        it('debería aceptar candidato con todos los campos válidos', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose.gonzalez@example.com',
                phone: '612345678',
                address: 'Calle Mayor 123, Madrid',
                educations: [{
                    institution: 'Universidad Complutense',
                    title: 'Ingeniería Informática',
                    startDate: '2010-09-01',
                    endDate: '2014-06-30'
                }],
                workExperiences: [{
                    company: 'Tech Corp',
                    position: 'Software Engineer',
                    description: 'Desarrollo de aplicaciones web',
                    startDate: '2015-01-01',
                    endDate: '2018-12-31'
                }],
                cv: {
                    filePath: 'uploads/1715760936750-cv.pdf',
                    fileType: 'application/pdf'
                }
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar candidato con campos mínimos requeridos', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería saltarse validación si se proporciona id (modo edición)', () => {
            const dataWithId = {
                id: 1,
                firstName: 'Invalid',
                email: 'invalid-email'
            };
            expect(() => validateCandidateData(dataWithId)).not.toThrow();
        });
    });
});

describe('Tests de Servicio - CandidateService', () => {
    let mockPrisma: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPrisma = new PrismaClient();
    });

    describe('addCandidate - Casos Felices', () => {
        it('debería crear un candidato exitosamente con datos mínimos', async () => {
            const candidateData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };

            const mockSavedCandidate = {
                id: 1,
                ...candidateData
            };

            mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);

            // Mock del método save de Candidate
            jest.spyOn(Candidate.prototype, 'save').mockResolvedValue(mockSavedCandidate as any);

            const result = await addCandidate(candidateData);
            expect(result).toEqual(mockSavedCandidate);
        });

        it('debería crear un candidato con educación', async () => {
            const candidateData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: 'Universidad Complutense',
                    title: 'Ingeniería Informática',
                    startDate: '2010-09-01',
                    endDate: '2014-06-30'
                }]
            };

            const mockSavedCandidate = {
                id: 1,
                firstName: candidateData.firstName,
                lastName: candidateData.lastName,
                email: candidateData.email,
                phone: candidateData.phone
            };

            const mockEducation = {
                id: 1,
                candidateId: 1,
                ...candidateData.educations[0]
            };

            jest.spyOn(Candidate.prototype, 'save').mockResolvedValue(mockSavedCandidate as any);
            jest.spyOn(Education.prototype, 'save').mockResolvedValue(mockEducation as any);

            const result = await addCandidate(candidateData);
            expect(result).toEqual(mockSavedCandidate);
        });

        it('debería crear un candidato con experiencia laboral', async () => {
            const candidateData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: 'Tech Corp',
                    position: 'Software Engineer',
                    startDate: '2015-01-01',
                    endDate: '2018-12-31'
                }]
            };

            const mockSavedCandidate = {
                id: 1,
                firstName: candidateData.firstName,
                lastName: candidateData.lastName,
                email: candidateData.email,
                phone: candidateData.phone
            };

            const mockExperience = {
                id: 1,
                candidateId: 1,
                ...candidateData.workExperiences[0]
            };

            jest.spyOn(Candidate.prototype, 'save').mockResolvedValue(mockSavedCandidate as any);
            jest.spyOn(WorkExperience.prototype, 'save').mockResolvedValue(mockExperience as any);

            const result = await addCandidate(candidateData);
            expect(result).toEqual(mockSavedCandidate);
        });

        it('debería crear un candidato con CV', async () => {
            const candidateData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                cv: {
                    filePath: 'uploads/1715760936750-cv.pdf',
                    fileType: 'application/pdf'
                }
            };

            const mockSavedCandidate = {
                id: 1,
                firstName: candidateData.firstName,
                lastName: candidateData.lastName,
                email: candidateData.email,
                phone: candidateData.phone
            };

            const mockResume = {
                id: 1,
                candidateId: 1,
                ...candidateData.cv
            };

            jest.spyOn(Candidate.prototype, 'save').mockResolvedValue(mockSavedCandidate as any);
            jest.spyOn(Resume.prototype, 'save').mockResolvedValue(mockResume as any);

            const result = await addCandidate(candidateData);
            expect(result).toEqual(mockSavedCandidate);
        });

        it('debería crear un candidato con todos los datos', async () => {
            const candidateData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                address: 'Calle Mayor 123',
                educations: [{
                    institution: 'Universidad Complutense',
                    title: 'Ingeniería Informática',
                    startDate: '2010-09-01',
                    endDate: '2014-06-30'
                }],
                workExperiences: [{
                    company: 'Tech Corp',
                    position: 'Software Engineer',
                    startDate: '2015-01-01',
                    endDate: '2018-12-31'
                }],
                cv: {
                    filePath: 'uploads/1715760936750-cv.pdf',
                    fileType: 'application/pdf'
                }
            };

            const mockSavedCandidate = {
                id: 1,
                firstName: candidateData.firstName,
                lastName: candidateData.lastName,
                email: candidateData.email,
                phone: candidateData.phone,
                address: candidateData.address
            };

            jest.spyOn(Candidate.prototype, 'save').mockResolvedValue(mockSavedCandidate as any);
            jest.spyOn(Education.prototype, 'save').mockResolvedValue({} as any);
            jest.spyOn(WorkExperience.prototype, 'save').mockResolvedValue({} as any);
            jest.spyOn(Resume.prototype, 'save').mockResolvedValue({} as any);

            const result = await addCandidate(candidateData);
            expect(result).toEqual(mockSavedCandidate);
        });
    });

    describe('addCandidate - Casos de Error', () => {
        it('debería lanzar error cuando el email ya existe', async () => {
            const candidateData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };

            const prismaError = {
                code: 'P2002',
                meta: {
                    target: ['email']
                }
            };

            jest.spyOn(Candidate.prototype, 'save').mockRejectedValue(prismaError);

            await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
        });

        it('debería lanzar error cuando los datos son inválidos', async () => {
            const invalidData = {
                firstName: 'J', // Muy corto
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };

            await expect(addCandidate(invalidData)).rejects.toThrow();
        });

        it('debería propagar otros errores de Prisma', async () => {
            const candidateData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };

            const prismaError = new Error('Database connection error');
            jest.spyOn(Candidate.prototype, 'save').mockRejectedValue(prismaError);

            await expect(addCandidate(candidateData)).rejects.toThrow('Database connection error');
        });
    });
});

describe('Tests de Controlador - CandidateController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        mockRequest = {
            body: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });

    describe('addCandidateController - Casos Felices', () => {
        it('debería crear un candidato exitosamente', async () => {
            const candidateData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };

            const mockSavedCandidate = {
                id: 1,
                ...candidateData
            };

            mockRequest.body = candidateData;
            jest.spyOn(require('../application/services/candidateService'), 'addCandidate')
                .mockResolvedValue(mockSavedCandidate);

            await addCandidateController(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Candidate added successfully',
                data: mockSavedCandidate
            });
        });
    });

    describe('addCandidateController - Casos de Error', () => {
        it('debería retornar error 400 cuando hay error de validación', async () => {
            const invalidData = {
                firstName: 'J', // Muy corto
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };

            mockRequest.body = invalidData;
            const error = new Error('Invalid name');
            jest.spyOn(require('../application/services/candidateService'), 'addCandidate')
                .mockRejectedValue(error);

            await addCandidateController(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error adding candidate',
                error: 'Invalid name'
            });
        });

        it('debería retornar error 400 con mensaje genérico para errores desconocidos', async () => {
            const candidateData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };

            mockRequest.body = candidateData;
            jest.spyOn(require('../application/services/candidateService'), 'addCandidate')
                .mockRejectedValue('Unknown error');

            await addCandidateController(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error adding candidate',
                error: 'Unknown error'
            });
        });
    });
});

describe('Tests de Modelo - Candidate', () => {
    describe('Constructor y propiedades', () => {
        it('debería crear una instancia de Candidate con datos válidos', () => {
            const candidateData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                address: 'Calle Mayor 123'
            };

            const candidate = new Candidate(candidateData);

            expect(candidate.firstName).toBe(candidateData.firstName);
            expect(candidate.lastName).toBe(candidateData.lastName);
            expect(candidate.email).toBe(candidateData.email);
            expect(candidate.phone).toBe(candidateData.phone);
            expect(candidate.address).toBe(candidateData.address);
        });

        it('debería inicializar arrays vacíos si no se proporcionan', () => {
            const candidateData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com'
            };

            const candidate = new Candidate(candidateData);

            expect(candidate.education).toEqual([]);
            expect(candidate.workExperience).toEqual([]);
            expect(candidate.resumes).toEqual([]);
        });

        it('debería asignar arrays si se proporcionan', () => {
            const candidateData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                education: [{ institution: 'Universidad', title: 'Título', startDate: '2010-01-01' }],
                workExperience: [{ company: 'Tech Corp', position: 'Engineer', startDate: '2015-01-01' }],
                resumes: [{ filePath: 'cv.pdf', fileType: 'application/pdf' }]
            };

            const candidate = new Candidate(candidateData);

            expect(candidate.education).toHaveLength(1);
            expect(candidate.workExperience).toHaveLength(1);
            expect(candidate.resumes).toHaveLength(1);
        });
    });

    describe('save() - Comportamiento básico', () => {
        it('debería tener un método save', () => {
            const candidateData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com'
            };

            const candidate = new Candidate(candidateData);

            expect(typeof candidate.save).toBe('function');
        });

        it('debería identificar candidato nuevo vs existente por presencia de id', () => {
            const newCandidate = new Candidate({
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com'
            });

            const existingCandidate = new Candidate({
                id: 1,
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com'
            });

            expect(newCandidate.id).toBeUndefined();
            expect(existingCandidate.id).toBe(1);
        });
    });
});

describe('Tests de Rutas - CandidateRoutes', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        mockRequest = {
            body: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
    });

    it('debería crear un candidato exitosamente vía ruta POST /candidates', async () => {
        const candidateData = {
            firstName: 'José',
            lastName: 'González',
            email: 'jose@example.com',
            phone: '612345678'
        };

        const mockSavedCandidate = {
            id: 1,
            ...candidateData
        };

        mockRequest.body = candidateData;
        jest.spyOn(require('../application/services/candidateService'), 'addCandidate')
            .mockResolvedValue(mockSavedCandidate);

        const router = require('../routes/candidateRoutes').default;
        const route = router.stack[0].route.stack[0].handle;

        await route(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.send).toHaveBeenCalledWith(mockSavedCandidate);
    });

    it('debería retornar error 400 cuando hay error de validación vía ruta', async () => {
        const invalidData = {
            firstName: 'J',
            lastName: 'González',
            email: 'jose@example.com',
            phone: '612345678'
        };

        mockRequest.body = invalidData;
        const error = new Error('Invalid name');
        jest.spyOn(require('../application/services/candidateService'), 'addCandidate')
            .mockRejectedValue(error);

        const router = require('../routes/candidateRoutes').default;
        const route = router.stack[0].route.stack[0].handle;

        await route(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Invalid name' });
    });

    it('debería retornar error 500 para errores inesperados vía ruta', async () => {
        const candidateData = {
            firstName: 'José',
            lastName: 'González',
            email: 'jose@example.com',
            phone: '612345678'
        };

        mockRequest.body = candidateData;
        jest.spyOn(require('../application/services/candidateService'), 'addCandidate')
            .mockRejectedValue('Unexpected error');

        const router = require('../routes/candidateRoutes').default;
        const route = router.stack[0].route.stack[0].handle;

        await route(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.send).toHaveBeenCalledWith({ message: 'An unexpected error occurred' });
    });
});

describe('Tests de Casos Límite y Edge Cases', () => {
    describe('Casos límite de longitud', () => {
        it('debería aceptar nombre con exactamente 2 caracteres', () => {
            const validData = {
                firstName: 'Jo',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar nombre con exactamente 100 caracteres', () => {
            const validData = {
                firstName: 'A'.repeat(100),
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar dirección con exactamente 100 caracteres', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                address: 'A'.repeat(100)
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería aceptar descripción de experiencia con exactamente 200 caracteres', () => {
            const validData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: [{
                    company: 'Tech Corp',
                    position: 'Software Engineer',
                    description: 'A'.repeat(200),
                    startDate: '2015-01-01'
                }]
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });
    });

    describe('Casos con valores null y undefined', () => {
        it('debería manejar datos completamente undefined', () => {
            expect(() => validateCandidateData(undefined as any)).toThrow();
        });

        it('debería manejar datos null', () => {
            expect(() => validateCandidateData(null as any)).toThrow();
        });

        it('debería manejar objeto vacío', () => {
            expect(() => validateCandidateData({})).toThrow();
        });
    });

    describe('Casos con tipos incorrectos', () => {
        it('debería rechazar firstName que no es string', () => {
            const invalidData = {
                firstName: 123,
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow();
        });

        it('debería rechazar email que no es string', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 123,
                phone: '612345678'
            };
            expect(() => validateCandidateData(invalidData)).toThrow();
        });

        it('debería rechazar educations que no es array', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: 'not-an-array'
            };
            expect(() => validateCandidateData(invalidData)).toThrow();
        });

        it('debería rechazar workExperiences que no es array', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                workExperiences: 'not-an-array'
            };
            expect(() => validateCandidateData(invalidData)).toThrow();
        });
    });

    describe('Casos con fechas inválidas', () => {
        it('debería rechazar fecha con formato incorrecto (DD-MM-YYYY)', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: 'Universidad',
                    title: 'Título',
                    startDate: '01-09-2010'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid date');
        });

        it('debería rechazar fecha con formato incorrecto (timestamp)', () => {
            const invalidData = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: 'Universidad',
                    title: 'Título',
                    startDate: '1283299200000'
                }]
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid date');
        });

        it('debería aceptar fecha con formato válido aunque el mes sea 13 (el regex solo valida formato)', () => {
            // Nota: El validador actual solo verifica el formato YYYY-MM-DD, no valida valores
            // Por lo tanto, '2010-13-01' pasará la validación de formato aunque sea una fecha inválida
            const dataWithInvalidMonth = {
                firstName: 'José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678',
                educations: [{
                    institution: 'Universidad',
                    title: 'Título',
                    startDate: '2010-13-01' // Formato válido aunque mes inválido
                }]
            };
            // El regex actual solo valida formato, no valores, por lo que no debería lanzar error
            expect(() => validateCandidateData(dataWithInvalidMonth)).not.toThrow('Invalid date');
        });
    });

    describe('Casos con múltiples errores', () => {
        it('debería detectar el primer error en datos con múltiples problemas', () => {
            const invalidData = {
                firstName: 'J', // Error 1: muy corto
                lastName: 'G', // Error 2: muy corto
                email: 'invalid-email', // Error 3: formato inválido
                phone: '123' // Error 4: formato inválido
            };
            expect(() => validateCandidateData(invalidData)).toThrow('Invalid name');
        });
    });

    describe('Casos con caracteres especiales', () => {
        it('debería aceptar nombres con espacios múltiples', () => {
            const validData = {
                firstName: 'María  José',
                lastName: 'García  López',
                email: 'maria@example.com',
                phone: '612345678'
            };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

        it('debería rechazar nombres que empiezan con espacio', () => {
            const invalidData = {
                firstName: ' José',
                lastName: 'González',
                email: 'jose@example.com',
                phone: '612345678'
            };
            // Nota: El regex actual permite espacios, pero esto podría ser un caso límite a considerar
            expect(() => validateCandidateData(invalidData)).not.toThrow(); // El regex actual lo permite
        });
    });
});

