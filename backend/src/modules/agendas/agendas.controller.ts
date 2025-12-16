import { Response } from 'express';
import { agendasService } from './agendas.service';
import { createAgendaSchema, updateAgendaSchema, queryAgendasSchema, generateSlotsSchema } from './agendas.dto';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthenticatedRequest } from '../../types';

export class AgendasController {
  /**
   * @route POST /api/v1/agendas
   * @desc Create new agenda
   * @access Private
   */
  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validated = createAgendaSchema.parse(req.body);
    const agenda = await agendasService.create(validated);

    res.status(201).json({
      success: true,
      data: agenda,
      message: 'Agenda created successfully',
    });
  });

  /**
   * @route GET /api/v1/agendas
   * @desc Get all agendas
   * @access Private
   */
  findAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validated = queryAgendasSchema.parse(req.query);
    const result = await agendasService.findAll(validated);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * @route GET /api/v1/agendas/:id
   * @desc Get agenda by ID
   * @access Private
   */
  findById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const agenda = await agendasService.findById(req.params.id);

    res.status(200).json({
      success: true,
      data: agenda,
    });
  });

  /**
   * @route PUT /api/v1/agendas/:id
   * @desc Update agenda
   * @access Private
   */
  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validated = updateAgendaSchema.parse(req.body);
    const agenda = await agendasService.update(req.params.id, validated);

    res.status(200).json({
      success: true,
      data: agenda,
      message: 'Agenda updated successfully',
    });
  });

  /**
   * @route DELETE /api/v1/agendas/:id
   * @desc Deactivate agenda
   * @access Private
   */
  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const agenda = await agendasService.delete(req.params.id);

    res.status(200).json({
      success: true,
      data: agenda,
      message: 'Agenda deactivated successfully',
    });
  });

  /**
   * @route POST /api/v1/agendas/:id/activate
   * @desc Activate agenda
   * @access Private
   */
  activate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const agenda = await agendasService.activate(req.params.id);

    res.status(200).json({
      success: true,
      data: agenda,
      message: 'Agenda activated successfully',
    });
  });

  /**
   * @route POST /api/v1/agendas/:id/generate-slots
   * @desc Generate slots for a date range
   * @access Private
   */
  generateSlots = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validated = generateSlotsSchema.parse({
      ...req.body,
      agendaId: req.params.id,
    });
    const slots = await agendasService.generateSlots(validated);

    res.status(201).json({
      success: true,
      data: slots,
      message: `${slots.length} slots generated successfully`,
    });
  });
}

export const agendasController = new AgendasController();
