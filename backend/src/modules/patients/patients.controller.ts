import { Request, Response } from 'express';
import { patientsService } from './patients.service';
import { createPacienteSchema, updatePacienteSchema, queryPacientesSchema } from './patients.dto';
import { asyncHandler } from '../../middleware/error.middleware';

export class PatientsController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const validated = createPacienteSchema.parse(req.body);
    const paciente = await patientsService.create(validated);

    res.status(201).json({
      success: true,
      data: paciente,
      message: 'Patient created successfully',
    });
  });

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const validated = queryPacientesSchema.parse(req.query);
    const result = await patientsService.findAll(validated);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const paciente = await patientsService.findById(id);

    res.status(200).json({
      success: true,
      data: paciente,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updatePacienteSchema.parse(req.body);
    const paciente = await patientsService.update(id, validated);

    res.status(200).json({
      success: true,
      data: paciente,
      message: 'Patient updated successfully',
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const paciente = await patientsService.delete(id);

    res.status(200).json({
      success: true,
      data: paciente,
      message: 'Patient deactivated successfully',
    });
  });
}

export const patientsController = new PatientsController();
