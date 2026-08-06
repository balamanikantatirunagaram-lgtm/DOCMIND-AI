import { PrismaClient } from '@prisma/client';
import { StorageService } from './StorageService';

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

    const document = await prisma.document.create({
      data: {
        title,
        fileUrl,
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
