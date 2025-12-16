import { Request, Response } from 'express';
import { slotsService } from './slots.service';
import {
  createSlotSchema,
  updateSlotSchema,
  lockSlotSchema,
  unlockSlotSchema,
  queryAvailableSlotsSchema,
} from './slots.dto';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthenticatedRequest } from '../../types';

export class SlotsController {
  /**
   * @route POST /api/v1/slots/lock
   * @desc Lock a slot for booking (N8N - secret validated by middleware)
   * @access N8N Secret
   */
  lockSlot = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = lockSlotSchema.parse(req.body);
    const lock = await slotsService.lockSlot(validated.slotId, validated.sessionId);

    res.status(200).json({
      success: true,
      data: lock,
      message: 'Slot locked successfully',
    });
  });

  /**
   * @route POST /api/v1/slots/unlock
   * @desc Unlock a slot (N8N - secret validated by middleware)
   * @access N8N Secret
   */
  unlockSlot = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = unlockSlotSchema.parse(req.body);
    await slotsService.unlockSlot(validated.slotId);

    res.status(200).json({
      success: true,
      message: 'Slot unlocked successfully',
    });
  });

  /**
   * @route GET /api/v1/slots/available
   * @desc Get available slots
   * @access Private
   */
  getAvailableSlots = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validated = queryAvailableSlotsSchema.parse(req.query);
    const slots = await slotsService.getAvailableSlots(validated);

    res.status(200).json({
      success: true,
      data: slots,
      count: slots.length,
    });
  });

  /**
   * @route GET /api/v1/slots/:id
   * @desc Get slot by ID
   * @access Private
   */
  findById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    console.log('🔍 [SlotsController] findById requested:', req.params.id);
    const slot = await slotsService.findById(req.params.id);

    res.status(200).json({
      success: true,
      data: slot,
    });
  });

  /**
   * @route POST /api/v1/slots
   * @desc Create a new slot
   * @access Private
   */
  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validated = createSlotSchema.parse(req.body);
    const slot = await slotsService.create(validated);

    res.status(201).json({
      success: true,
      data: slot,
      message: 'Slot created successfully',
    });
  });

  /**
   * @route PUT /api/v1/slots/:id
   * @desc Update a slot
   * @access Private
   */
  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validated = updateSlotSchema.parse(req.body);
    const slot = await slotsService.update(req.params.id, validated);

    res.status(200).json({
      success: true,
      data: slot,
      message: 'Slot updated successfully',
    });
  });

  /**
   * @route DELETE /api/v1/slots/:id
   * @desc Delete a slot (only if not booked)
   * @access Private
   */
  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await slotsService.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Slot deleted successfully',
    });
  });

  /**
   * @route PATCH /api/v1/slots/:id/block
   * @desc Block a slot manually (from frontend)
   * @access Private
   */
  blockSlot = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const slotId = req.params.id;
    const sessionId = `user_${req.user!.id}`;

    const lock = await slotsService.lockSlot(slotId, sessionId);

    res.status(200).json({
      success: true,
      data: lock,
      message: 'Slot blocked successfully',
    });
  });

  /**
   * @route PATCH /api/v1/slots/:id/unblock
   * @desc Unblock a slot manually (from frontend)
   * @access Private
   */
  unblockSlot = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const slotId = req.params.id;

    await slotsService.unlockSlot(slotId);

    res.status(200).json({
      success: true,
      message: 'Slot unblocked successfully',
    });
  });
}

export const slotsController = new SlotsController();
