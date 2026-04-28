import { Router } from 'express';
import { RegistrationController } from '../controllers/registration.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// User-scoped
router.get('/my-registrations', RegistrationController.getMyRegistrations);
router.post('/', RegistrationController.createRegistration);

// Admin/owner
router.get('/:id', RegistrationController.getRegistration);
router.post('/:id/cancel', RegistrationController.cancelRegistration);

// Admin-only
router.get('/', authorize('admin'), RegistrationController.getAllRegistrations);
router.get('/stats/overall', authorize('admin'), RegistrationController.getOverallStats);
router.get('/event/:eventId', authorize('admin'), RegistrationController.getEventRegistrations);
router.get('/event/:eventId/stats', authorize('admin'), RegistrationController.getEventStats);
router.get('/event/:eventId/csv', authorize('admin'), RegistrationController.exportEventCsv);
router.patch('/:id', authorize('admin'), RegistrationController.updateRegistration);
router.delete('/:id', authorize('admin'), RegistrationController.deleteRegistration);
router.post('/:id/resend-confirmation', authorize('admin'), RegistrationController.resendConfirmation);

export default router;
