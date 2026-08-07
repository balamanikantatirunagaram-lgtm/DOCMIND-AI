import prisma from '../lib/prisma';
import { StorageService } from './StorageService';
import { AIService } from './AIService';
const pdfParse = require('pdf-parse');
const { pdfToPng } = require('pdf-to-png-converter');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
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
          const pngPages = await pdfToPng(file.buffer, { 
            viewportScale: 2.0,
            pagesToProcess: [1, 2, 3] // Only convert first 3 pages to PNG to save massive memory/time
          });
          let ocrText = '';
          // Send the generated PNG pages to AI Vision
          for (const page of pngPages) {
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
      } else if (file.originalname.match(/\.docx?$/i) || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Handle Word Documents
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = result.value;
      } else if (file.originalname.match(/\.xlsx?$/i) || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        // Handle Excel Spreadsheets
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        let csvText = '';
        workbook.SheetNames.forEach((sheetName: string) => {
          csvText += `\n--- Sheet: ${sheetName} ---\n`;
          csvText += xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        });
        extractedText = csvText;
      } else {
        // Fallback for unsupported binary files
        extractedText = `[File uploaded: ${file.originalname}, but text extraction is not supported for this file type]`;
      }
    } catch (err) {
      console.error('Failed to parse document text', err);
    }

    let type = null;
    let summary = null;
    let folder = null;
    let entities: any[] = [];

    if (extractedText && extractedText.length > 50) {
      try {
        console.log('Classifying and summarizing document...');
        const aiResult = await aiService.classifyAndSummarizeDocument(extractedText);
        type = aiResult.type;
        summary = aiResult.summary;
        folder = aiResult.folder;

        console.log('Extracting structured data entities...');
        entities = await aiService.extractEntities(extractedText);
      } catch (err) {
        console.error('Failed to classify, summarize, or extract entities', err);
      }
    }

    const document = await prisma.document.create({
      data: {
        title,
        fileUrl,
        extractedText,
        type,
        summary,
        folder,
        uploaderId,
        organizationId,
        entities: {
          create: entities.map(entity => ({
            type: entity.type,
            value: entity.value,
            confidence: entity.confidence || 0.9,
          }))
        }
      },
      include: {
        entities: true
      }
    });

    return document;
  }

  public async getDocuments(organizationId: string) {
    return prisma.document.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: { entities: true },
    });
  }

  public async getDocumentById(id: string, organizationId: string) {
    return prisma.document.findFirst({
      where: { id, organizationId },
      include: { entities: true },
    });
  }

  public async deleteDocument(id: string, organizationId: string) {
    const document = await prisma.document.findFirst({
      where: { id, organizationId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    await prisma.document.delete({
      where: { id },
    });

    return true;
  }

  public async updateDocument(id: string, organizationId: string, data: { title?: string, folder?: string, isStarred?: boolean }) {
    const document = await prisma.document.findFirst({
      where: { id, organizationId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return prisma.document.update({
      where: { id },
      data,
      include: { entities: true }
    });
  }

  public async updateEntities(documentId: string, organizationId: string, entities: Array<{ type: string, value: string, confidence?: number }>) {
    const document = await prisma.document.findFirst({
      where: { id: documentId, organizationId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Delete existing entities and recreate to ensure a clean sync
    await prisma.extractedEntity.deleteMany({
      where: { documentId }
    });

    if (entities.length > 0) {
      await prisma.extractedEntity.createMany({
        data: entities.map(e => ({
          documentId,
          type: e.type,
          value: e.value,
          confidence: e.confidence || 1.0 // Manual edits get 100% confidence
        }))
      });
    }

    return prisma.document.findUnique({
      where: { id: documentId },
      include: { entities: true }
    });
  }

  public async getGraphData(organizationId: string) {
    const documents = await prisma.document.findMany({
      where: { organizationId },
      include: { entities: true },
    });

    const nodes: any[] = [];
    const links: any[] = [];
    
    // Map to keep track of entity values to link documents that share them
    const entityNodeMap = new Map<string, string>(); // value -> entityNodeId

    documents.forEach(doc => {
      // Add document node
      nodes.push({
        id: `doc-${doc.id}`,
        name: doc.title,
        type: 'Document',
        val: 20 // node size
      });

      doc.entities.forEach(entity => {
        const entityValue = entity.value.trim().toLowerCase();
        if (!entityValue) return;
        
        const entityNodeId = `entity-${entityValue}`;
        
        // Add entity node if it doesn't exist
        if (!entityNodeMap.has(entityValue)) {
          entityNodeMap.set(entityValue, entityNodeId);
          nodes.push({
            id: entityNodeId,
            name: entity.value, // Original casing
            type: entity.type,
            val: 10
          });
        }

        // Link document to entity
        links.push({
          source: `doc-${doc.id}`,
          target: entityNodeId,
          label: 'has_entity'
        });
      });
    });

    return { nodes, links };
  }
}
