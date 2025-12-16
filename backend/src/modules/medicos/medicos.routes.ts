import { Router } from 'express';
import { medicosController } from './medicos.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', medicosController.findAll);
router.get('/:id', medicosController.findById);
router.post('/', medicosController.create);
router.put('/:id', medicosController.update);
router.delete('/:id', medicosController.delete);
router.post('/:id/activate', medicosController.activate);

export default router;
