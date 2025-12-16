import { Request, Response } from 'express';
import { especialidadesService } from './especialidades.service';
import { createEspecialidadSchema, updateEspecialidadSchema } from './especialidades.dto';
import { asyncHandler } from '../../middleware/error.middleware';

export class EspecialidadesController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const validated = createEspecialidadSchema.parse(req.body);
    const especialidad = await especialidadesService.create(validated);

    res.status(201).json({
      success: true,
      data: especialidad,
    });
  });

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const especialidades = await especialidadesService.findAll();

    res.status(200).json({
      success: true,
      data: especialidades,
    });
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const especialidad = await especialidadesService.findById(req.params.id);

    res.status(200).json({
      success: true,
      data: especialidad,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const validated = updateEspecialidadSchema.parse(req.body);
    const especialidad = await especialidadesService.update(req.params.id, validated);

    res.status(200).json({
      success: true,
      data: especialidad,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const especialidad = await especialidadesService.delete(req.params.id);

    res.status(200).json({
      success: true,
      data: especialidad,
    });
  });
}

export const especialidadesController = new EspecialidadesController();
