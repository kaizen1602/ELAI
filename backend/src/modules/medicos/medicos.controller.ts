import { Request, Response } from 'express';
import { medicosService } from './medicos.service';
import { createMedicoSchema, updateMedicoSchema } from './medicos.dto';
import { asyncHandler } from '../../middleware/error.middleware';

export class MedicosController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const validated = createMedicoSchema.parse(req.body);
    const medico = await medicosService.create(validated);
    res.status(201).json({ success: true, data: medico });
  });

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const { entidadMedicaId } = req.query;
    const medicos = await medicosService.findAll(entidadMedicaId as string);
    res.status(200).json({ success: true, data: medicos });
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const medico = await medicosService.findById(req.params.id);
    res.status(200).json({ success: true, data: medico });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const validated = updateMedicoSchema.parse(req.body);
    const medico = await medicosService.update(req.params.id, validated);
    res.status(200).json({ success: true, data: medico });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const medico = await medicosService.delete(req.params.id);
    res.status(200).json({ success: true, data: medico });
  });

  activate = asyncHandler(async (req: Request, res: Response) => {
    const medico = await medicosService.activate(req.params.id);
    res.status(200).json({ success: true, data: medico });
  });
}

export const medicosController = new MedicosController();
