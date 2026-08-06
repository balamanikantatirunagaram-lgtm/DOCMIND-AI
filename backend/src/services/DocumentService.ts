import { PrismaClient } from '@prisma/client';
import { StorageService } from './StorageService';
const pdfParse = require('pdf-parse');

const prisma = new PrismaClient();
const storageService = new StorageService();

export class DocumentService {
  public async uploadDocument(
    file: Express.Multer.File,
    title: string,
    uploaderId: string,
    organizationId: string
  ) {
    const path = `org-${organizationId}/${Date.now()}-${file.originalname}`;
    const fileUrl = await storageService.uploadFile(file, path);

    let extractedText = null;
    try {
      if (file.mimetype === 'application/pdf') {
        const data = await pdfParse(file.buffer);
        extractedText = data.text;
      } else if (
        file.mimetype.startsWith('text/') || 
        file.mimetype === 'application/json' || 
        file.originalname.match(/\.(tsx|ts|jsx|js|csv|md)$/i)
      ) {
        // Handle code and text files directly
        extractedText = file.buffer.toString('utf-8');
      } else {
        // Fallback for images or unsupported binary files
        extractedText = `[File uploaded: ${file.originalname}, but text extraction is not supported for this file type]`;
      }
    } catch (err) {
      console.error('Failed to parse document text', err);
    }

    const document = await prisma.document.create({
      data: {
        title,
        fileUrl,
        extractedText,
        uploaderId,
        organizationId,
      },
    });

    return document;
  }

  public async getDocuments(organizationId: string) {
    return prisma.document.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getDocumentById(id: string, organizationId: string) {
    return prisma.document.findFirst({
      where: { id, organizationId },
      include: { entities: true },
    });
  }
}
