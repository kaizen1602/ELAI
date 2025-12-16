import { Router } from 'express';
import { especialidadesController } from './especialidades.controller';
import { authenticate } from '../auth/auth.middleware';
import { isAdminEntidad } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', especialidadesController.findAll);
router.get('/:id', especialidadesController.findById);
router.post('/', isAdminEntidad, especialidadesController.create);
router.put('/:id', isAdminEntidad, especialidadesController.update);
router.delete('/:id', isAdminEntidad, especialidadesController.delete);

export default router;
