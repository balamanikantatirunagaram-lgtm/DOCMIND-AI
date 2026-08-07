import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AIService } from '../services/AIService';
import prisma from '../lib/prisma';

const aiService = new AIService();

export class AIController {
  public async summarize(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { text } = req.body;
      if (!text) {
        res.status(400).json({ error: 'Text is required for summarization' });
        return;
      }

      const summary = await aiService.summarizeDocument(text);
      res.status(200).json({ summary });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  public async chat(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { chatId, message } = req.body;
      
      let chat;
      if (chatId) {
        chat = await prisma.chat.findUnique({ where: { id: chatId }, include: { messages: true } });
        if (!chat || chat.userId !== req.user.id) {
          res.status(404).json({ error: 'Chat not found' });
          return;
        }
      } else {
        const title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
        chat = await prisma.chat.create({
          data: { userId: req.user.id, title },
          include: { messages: true }
        });
      }

      await prisma.message.create({
        data: {
          chatId: chat.id,
          role: 'user',
          content: message,
        },
      });

      const recentDocs = await prisma.document.findMany({
        where: { uploaderId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 3
      });
      let systemPrompt = "You are DocMind AI, an intelligent document processing assistant. Use the provided document context to answer questions accurately. If the user refers to a document or element, analyze the text provided below.";
      if (recentDocs.length > 0) {
        systemPrompt += "\n\nHere are the most recently uploaded documents for context:\n";
        for (const doc of recentDocs) {
          systemPrompt += `\n--- Document: ${doc.title} ---\n`;
          systemPrompt += doc.extractedText ? doc.extractedText.substring(0, 10000) : "No text extracted or it was an image.";
        }
      }

      const messagesForAI = [
        { role: 'system', content: systemPrompt },
        ...chat.messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ];

      const aiResponse = await aiService.chat(messagesForAI);

      const savedAiMessage = await prisma.message.create({
        data: {
          chatId: chat.id,
          role: 'assistant',
          content: aiResponse,
        },
      });

      res.status(200).json({ chatId: chat.id, message: savedAiMessage });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  public async getChats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
      const chats = await prisma.chat.findMany({
        where: { userId: req.user.id },
        include: { messages: true },
        orderBy: { updatedAt: 'desc' }
      });
      res.status(200).json(chats);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  public async getChatById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
      const { id } = req.params;
      const chat = await prisma.chat.findUnique({
        where: { id: id as string },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
      if (!chat || chat.userId !== req.user.id) { res.status(404).json({ error: 'Chat not found' }); return; }
      res.status(200).json(chat);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  public async deleteChat(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
      const { id } = req.params;
      const chatId = id as string;
      const chat = await prisma.chat.findUnique({ where: { id: chatId } });
      if (!chat || chat.userId !== req.user.id) { res.status(404).json({ error: 'Chat not found' }); return; }
      
      // Delete messages first to satisfy foreign key constraints (if any)
      await prisma.message.deleteMany({ where: { chatId: chatId } });
      await prisma.chat.delete({ where: { id: chatId } });
      
      res.status(200).json({ message: 'Chat deleted' });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  public async generateReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const { documentIds } = req.body;
      
      const whereClause: any = { organizationId: req.user.organizationId };
      if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
        whereClause.id = { in: documentIds };
      }

      const documents = await prisma.document.findMany({
        where: whereClause,
        select: { title: true, type: true, summary: true }
      });
      
      const reportMarkdown = await aiService.generateExecutiveReport(documents);
      res.status(200).json({ report: reportMarkdown });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
