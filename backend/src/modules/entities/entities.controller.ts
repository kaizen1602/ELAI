import { Request, Response } from 'express';
import { entitiesService } from './entities.service';
import { createEntidadSchema, updateEntidadSchema, queryEntidadesSchema } from './entities.dto';
import { asyncHandler } from '../../middleware/error.middleware';

export class EntitiesController {
  /**
   * @route POST /api/v1/entities
   * @desc Create new medical entity
   * @access Private (SuperAdmin, Admin)
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const validated = createEntidadSchema.parse(req.body);
    const entidad = await entitiesService.create(validated);

    res.status(201).json({
      success: true,
      data: entidad,
      message: 'Medical entity created successfully',
    });
  });

  /**
   * @route GET /api/v1/entities
   * @desc Get all medical entities
   * @access Private
   */
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const validated = queryEntidadesSchema.parse(req.query);
    const result = await entitiesService.findAll(validated);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * @route GET /api/v1/entities/:id
   * @desc Get medical entity by ID
   * @access Private
   */
  findById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const entidad = await entitiesService.findById(id);

    res.status(200).json({
      success: true,
      data: entidad,
    });
  });

  /**
   * @route PUT /api/v1/entities/:id
   * @desc Update medical entity
   * @access Private (SuperAdmin, Admin)
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updateEntidadSchema.parse(req.body);
    const entidad = await entitiesService.update(id, validated);

    res.status(200).json({
      success: true,
      data: entidad,
      message: 'Medical entity updated successfully',
    });
  });

  /**
   * @route DELETE /api/v1/entities/:id
   * @desc Deactivate medical entity
   * @access Private (SuperAdmin)
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const entidad = await entitiesService.delete(id);

    res.status(200).json({
      success: true,
      data: entidad,
      message: 'Medical entity deactivated successfully',
    });
  });

  /**
   * @route POST /api/v1/entities/:id/activate
   * @desc Activate medical entity
   * @access Private (SuperAdmin)
   */
  activate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const entidad = await entitiesService.activate(id);

    res.status(200).json({
      success: true,
      data: entidad,
      message: 'Medical entity activated successfully',
    });
  });

  /**
   * @route GET /api/v1/entities/:id/statistics
   * @desc Get entity statistics
   * @access Private
   */
  getStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const stats = await entitiesService.getStatistics(id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });
}

export const entitiesController = new EntitiesController();
