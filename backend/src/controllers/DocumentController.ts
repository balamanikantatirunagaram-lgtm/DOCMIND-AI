import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DocumentService } from '../services/DocumentService';

const documentService = new DocumentService();

export class DocumentController {
  public async uploadDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { title } = req.body;
      const document = await documentService.uploadDocument(
        req.file,
        title || req.file.originalname,
        req.user.id,
        req.user.organizationId
      );

      res.status(201).json(document);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  public async getDocuments(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const documents = await documentService.getDocuments(req.user.organizationId);
      res.status(200).json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  public async getDocumentById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const document = await documentService.getDocumentById(id as string, req.user.organizationId);
      
      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      res.status(200).json(document);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  public async deleteDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      await documentService.deleteDocument(id as string, req.user.organizationId);
      
      res.status(200).json({ success: true });
    } catch (error: any) {
      if (error.message === 'Document not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  public async updateDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { title, folder, isStarred } = req.body;
      
      const updatedDocument = await documentService.updateDocument(id as string, req.user.organizationId, {
        title,
        folder,
        isStarred
      });
      
      res.status(200).json(updatedDocument);
    } catch (error: any) {
      if (error.message === 'Document not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  public async updateEntities(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { entities } = req.body;
      
      if (!Array.isArray(entities)) {
        res.status(400).json({ error: 'Entities must be an array' });
        return;
      }

      const updatedDocument = await documentService.updateEntities(id as string, req.user.organizationId, entities);
      
      res.status(200).json(updatedDocument);
    } catch (error: any) {
      if (error.message === 'Document not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  public async getGraphData(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      const graphData = await documentService.getGraphData(req.user.organizationId);
      res.status(200).json(graphData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
