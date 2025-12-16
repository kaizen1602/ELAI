import { Request, Response } from 'express';
import { citasService } from './citas.service';
import {
  createCitaSchema,
  createCitaN8NSchema,
  updateCitaSchema,
  queryCitasSchema,
  cancelCitaSchema,
} from './citas.dto';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthenticatedRequest } from '../../types';

export class CitasController {
  /**
   * @route POST /api/v1/citas/create
   * @desc Create cita from N8N (secret validated by middleware)
   * @access N8N Secret
   */
  createFromN8N = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = createCitaN8NSchema.parse(req.body);
    const cita = await citasService.create(validated);

    res.status(201).json({
      success: true,
      data: cita,
      message: 'Appointment created successfully',
    });
  });

  /**
   * @route POST /api/v1/citas
   * @desc Create cita (authenticated)
   * @access Private
   */
  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validated = createCitaSchema.parse(req.body);
    const cita = await citasService.create(validated);

    res.status(201).json({
      success: true,
      data: cita,
      message: 'Appointment created successfully',
    });
  });

  /**
   * @route GET /api/v1/citas
   * @desc Get all citas with filters
   * @access Private
   */
  findAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validated = queryCitasSchema.parse(req.query);
    const result = await citasService.findAll(validated);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * @route GET /api/v1/citas/:id
   * @desc Get cita by ID
   * @access Private
   */
  findById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const cita = await citasService.findById(req.params.id);

    res.status(200).json({
      success: true,
      data: cita,
    });
  });

  /**
   * @route PUT /api/v1/citas/:id
   * @desc Update cita
   * @access Private
   */
  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validated = updateCitaSchema.parse(req.body);
    const cita = await citasService.update(req.params.id, validated);

    res.status(200).json({
      success: true,
      data: cita,
      message: 'Appointment updated successfully',
    });
  });

  /**
   * @route POST /api/v1/citas/:id/cancel
   * @desc Cancel cita
   * @access Private
   */
  cancel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validated = cancelCitaSchema.parse(req.body);
    const cita = await citasService.cancel(req.params.id, validated.motivo);

    res.status(200).json({
      success: true,
      data: cita,
      message: 'Appointment cancelled successfully',
    });
  });

  /**
   * @route POST /api/v1/citas/:id/confirm
   * @desc Confirm cita
   * @access Private
   */
  confirm = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const cita = await citasService.confirm(req.params.id);

    res.status(200).json({
      success: true,
      data: cita,
      message: 'Appointment confirmed successfully',
    });
  });

  /**
   * @route POST /api/v1/citas/:id/complete
   * @desc Mark cita as completed
   * @access Private
   */
  complete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const cita = await citasService.complete(req.params.id);

    res.status(200).json({
      success: true,
      data: cita,
      message: 'Appointment marked as completed',
    });
  });

  /**
   * @route POST /api/v1/citas/:id/no-show
   * @desc Mark cita as no-show
   * @access Private
   */
  noShow = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const cita = await citasService.noShow(req.params.id);

    res.status(200).json({
      success: true,
      data: cita,
      message: 'Appointment marked as no-show',
    });
  });
}

export const citasController = new CitasController();
