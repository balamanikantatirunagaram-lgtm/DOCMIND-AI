import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FolderController {
  public async getFolders(req: any, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      const folders = await prisma.folder.findMany({
        where: { organizationId: req.user.organizationId }
      });
      
      res.status(200).json(folders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  public async createFolder(req: any, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      const folder = await prisma.folder.create({
        data: {
          name,
          organizationId: req.user.organizationId
        }
      });
      
      res.status(201).json(folder);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
