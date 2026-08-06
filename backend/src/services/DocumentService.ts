import { PrismaClient } from '@prisma/client';
import { StorageService } from './StorageService';
import { AIService } from './AIService';
const pdfParse = require('pdf-parse');
const { pdfToPng } = require('pdf-to-png-converter');

const prisma = new PrismaClient();
const storageService = new StorageService();
const aiService = new AIService();

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
        
        // If it's a scanned PDF (no text), use OCR
        if (!extractedText || extractedText.trim().length < 50) {
          console.log('Running AI Vision OCR on scanned PDF...');
          const pngPages = await pdfToPng(file.buffer, { viewportScale: 2.0 });
          let ocrText = '';
          // Only OCR first 3 pages to save time/memory for large PDFs
          for (const page of pngPages.slice(0, 3)) {
            const base64Image = page.content.toString('base64');
            const text = await aiService.extractTextFromImage(base64Image);
            ocrText += text + '\n';
          }
          extractedText = ocrText;
        }
      } else if (file.mimetype.startsWith('image/')) {
        console.log('Running AI Vision OCR on image...');
        const base64Image = file.buffer.toString('base64');
        const text = await aiService.extractTextFromImage(base64Image);
        extractedText = text;
      } else if (
        file.mimetype.startsWith('text/') || 
        file.mimetype === 'application/json' || 
        file.originalname.match(/\.(tsx|ts|jsx|js|csv|md)$/i)
      ) {
        // Handle code and text files directly
        extractedText = file.buffer.toString('utf-8');
      } else {
        // Fallback for unsupported binary files
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
