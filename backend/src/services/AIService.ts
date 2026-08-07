import axios from 'axios';

export class AIService {
  private readonly apiUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
  
  public async summarizeDocument(text: string): Promise<string> {
    const response = await this.callNvidiaApi([
      { role: 'system', content: 'You are an AI assistant that summarizes documents.' },
      { role: 'user', content: `Summarize the following document:\n\n${text}` }
    ]);
    return response;
  }

  public async classifyAndSummarizeDocument(text: string): Promise<{ type: string, summary: string, folder: string }> {
    const prompt = `You are a document analyzer. Analyze the following document text and provide a JSON response with exactly three keys: 
    1. "type" (a short string like "Invoice", "Contract", "Resume", "Medical Report", "Financial Statement", or "Other")
    2. "folder" (a category folder name to organize this into, exactly one of: "Finance", "HR", "Legal", "Operations", or "Misc")
    3. "summary" (a 1-2 sentence concise summary of the document).
    
    Document text: ${text.substring(0, 6000)}
    
    Return ONLY valid JSON.`;
    
    const response = await this.callNvidiaApi([
      { role: 'user', content: prompt }
    ], 'meta/llama-3.1-8b-instruct');
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.folder) parsed.folder = "Misc";
        return parsed;
      }
      return { type: "Other", summary: response, folder: "Misc" };
    } catch (e) {
      return { type: "Other", summary: "Failed to parse AI response.", folder: "Misc" };
    }
  }

  public async extractEntities(text: string): Promise<{ type: string, value: string, confidence: number }[]> {
    const prompt = `You are a data extraction AI. Extract the most important structured data (entities) from the following document text.
    Return ONLY a valid JSON array of objects. Each object must have exactly three keys: "type" (string, e.g. "Name", "Date", "Total Amount", "Invoice Number", "Address"), "value" (string, the extracted value), and "confidence" (number between 0 and 1 indicating how certain you are).
    Extract between 0 and 10 key entities depending on what is relevant.
    
    Document text: ${text.substring(0, 6000)}`;

    const response = await this.callNvidiaApi([
      { role: 'user', content: prompt }
    ], 'meta/llama-3.1-8b-instruct');

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (e) {
      console.error('Failed to parse entities JSON', e);
      return [];
    }
  }

  public async extractTextFromImage(base64Image: string): Promise<string> {
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract all the text from this image exactly as written. Preserve the layout and structure as much as possible. Do not include any conversational filler.' },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } }
        ]
      }
    ];
    return this.callNvidiaApi(messages as any, 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning');
  }

  public async chat(messages: { role: string; content: string }[]): Promise<string> {
    return this.callNvidiaApi(messages, 'meta/llama-3.1-8b-instruct');
  }

  private async callNvidiaApi(messages: any[], model: string = 'meta/llama-3.1-8b-instruct'): Promise<string> {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY is not set');
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: model,
          messages: messages,
          max_tokens: 1024,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('NVIDIA API Error:', error);
      throw new Error('Failed to communicate with AI service');
    }
  }

  public async generateKnowledgeGraph(documents: any[]): Promise<{ nodes: any[], links: any[] }> {
    const docData = documents.map(d => ({
      id: d.id,
      title: d.title,
      summary: d.summary,
      entities: d.entities?.map((e: any) => ({ type: e.type, value: e.value })) || []
    }));

    const prompt = `You are a data analysis AI. I am providing you a list of documents along with their summaries and extracted entities.
    Please construct a knowledge graph connecting these documents. 
    1. Identify shared concepts, direct relationships, or contradictions between the documents.
    2. Create nodes for each document (type: "Document") and for key shared concepts/entities (type: "Entity").
    3. Create links between them. The links must have a "source" (id of node), "target" (id of node), a short "label", and a highly detailed "details" field explaining EXACTLY why they are related, doing deep research based on the text.
    
    Return ONLY a valid JSON object matching this structure:
    {
      "nodes": [
        { "id": "unique-node-id", "name": "Node Label", "type": "Document" | "Entity" }
      ],
      "links": [
        { "source": "source-node-id", "target": "target-node-id", "label": "short label", "details": "Detailed 2-3 sentence explanation of how these connect..." }
      ]
    }
    
    Ensure document node IDs match the provided document IDs.
    IMPORTANT: Return pure JSON only. Do not wrap in json markdown blocks. Do not add any preamble text.
    
    Documents: ${JSON.stringify(docData, null, 2)}`;

    const response = await this.callNvidiaApi([
      { role: 'user', content: prompt }
    ], 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning');

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.nodes && parsed.links) {
          return parsed;
        }
      }
      return { nodes: [], links: [] };
    } catch (e) {
      console.error('Failed to parse AI graph JSON', e);
      return { nodes: [], links: [] };
    }
  }
  public async generateExecutiveReport(documents: { title: string; type: string | null; summary: string | null }[]): Promise<string> {
    try {
      if (documents.length === 0) {
        return "No documents available to generate a report.";
      }

      let contextStr = documents.map(d => `Document: ${d.title}\nType: ${d.type}\nSummary: ${d.summary}\n---`).join('\n');

      const response = await this.callNvidiaApi([
        {
          role: 'system',
          content: `You are an elite business analyst. Your job is to read the summaries of the company's recent documents and generate a brilliant, highly structured "Executive Insight Report" in Markdown format.
Focus on identifying key trends, financial highlights, risks, action items, and strategic insights across all the provided documents. Use headings, bullet points, and bold text to make it extremely scannable and professional.`
        },
        {
          role: 'user',
          content: `Generate an Executive Insight Report based on these documents:\n\n${contextStr}`
        }
      ], 'meta/llama-3.1-8b-instruct');

      return response;
    } catch (error) {
      console.error('AI generateExecutiveReport error:', error);
      throw new Error('Failed to generate executive report');
    }
  }
}
