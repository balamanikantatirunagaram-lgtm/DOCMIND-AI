import { Router } from 'express';
import { FolderController } from '../controllers/FolderController';
import { authenticate } from '../middleware/auth';

const router = Router();
const folderController = new FolderController();

router.use(authenticate);

router.get('/', folderController.getFolders.bind(folderController));
router.post('/', folderController.createFolder.bind(folderController));

export default router;
