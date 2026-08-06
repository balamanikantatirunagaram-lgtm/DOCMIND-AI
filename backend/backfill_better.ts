import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const docs = await prisma.document.findMany();
  for (const doc of docs) {
    if (doc.folder === 'Misc') {
      let folder = "Misc";
      const t = (doc.type || "").toLowerCase();
      
      if (t.includes('invoice') || t.includes('receipt') || t.includes('financial') || t.includes('bank') || t.includes('quote') || t.includes('quotation') || t.includes('statement')) {
        folder = "Finance";
      } else if (t.includes('resume') || t.includes('cv') || t.includes('offer') || t.includes('employee')) {
        folder = "HR";
      } else if (t.includes('contract') || t.includes('nda') || t.includes('agreement') || t.includes('legal')) {
        folder = "Legal";
      } else if (t.includes('report') || t.includes('memo') || t.includes('plan')) {
        folder = "Operations";
      } else if (doc.title.toLowerCase().includes('invoice') || doc.title.toLowerCase().includes('statement')) {
        folder = "Finance";
      } else if (doc.title.toLowerCase().includes('resume') || doc.title.toLowerCase().includes('members')) {
        folder = "HR";
      } else if (doc.title.toLowerCase().includes('quotation') || doc.title.toLowerCase().includes('cadv')) {
        folder = "Finance";
      } else if (doc.title.toLowerCase().includes('doc_0001')) {
        folder = "Operations";
      }
      
      if (folder !== 'Misc') {
        await prisma.document.update({
          where: { id: doc.id },
          data: { folder }
        });
        console.log(`Updated ${doc.title} to folder ${folder}`);
      }
    }
  }
}
run();
