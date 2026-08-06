import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const docs = await prisma.document.findMany();
  for (const doc of docs) {
    if (!doc.folder) {
      let folder = "Misc";
      if (doc.type === "Invoice" || doc.type === "Financial Statement") folder = "Finance";
      if (doc.type === "Resume") folder = "HR";
      if (doc.type === "Contract") folder = "Legal";
      
      await prisma.document.update({
        where: { id: doc.id },
        data: { folder }
      });
      console.log(`Updated ${doc.title} to folder ${folder}`);
    }
  }
}
run();
