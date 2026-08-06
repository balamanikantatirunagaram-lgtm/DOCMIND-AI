import { Router } from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/DocumentController';
import { authenticate } from '../middleware/auth';

const router = Router();
const documentController = new DocumentController();

const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post('/upload', upload.single('file'), documentController.uploadDocument.bind(documentController));
router.post('/graph/ai', documentController.generateAIGraph.bind(documentController));
router.get('/graph', documentController.getGraphData.bind(documentController));
router.get('/', documentController.getDocuments.bind(documentController));
router.get('/:id', documentController.getDocumentById.bind(documentController));
router.delete('/:id', documentController.deleteDocument.bind(documentController));
router.patch('/:id', documentController.updateDocument.bind(documentController));
router.put('/:id/entities', documentController.updateEntities.bind(documentController));

export default router;
