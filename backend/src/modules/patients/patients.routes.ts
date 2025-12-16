import { Router } from 'express';
import { patientsController } from './patients.controller';
import { authenticate } from '../auth/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createPacienteSchema, updatePacienteSchema, queryPacientesSchema } from './patients.dto';

const router = Router();

router.use(authenticate);

router.get('/', validate(queryPacientesSchema, 'query'), patientsController.findAll);
router.get('/:id', patientsController.findById);
router.post('/', validate(createPacienteSchema), patientsController.create);
router.put('/:id', validate(updatePacienteSchema), patientsController.update);
router.delete('/:id', patientsController.delete);

export default router;
