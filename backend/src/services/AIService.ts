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

  public async classifyAndSummarizeDocument(text: string): Promise<{ type: string, summary: string }> {
    const prompt = `You are a document analyzer. Analyze the following document text and provide a JSON response with exactly two keys: "type" (a short string like "Invoice", "Contract", "Resume", "Medical Report", "Financial Statement", or "Other") and "summary" (a 1-2 sentence concise summary of the document).
    
    Document text: ${text.substring(0, 6000)}
    
    Return ONLY valid JSON.`;
    
    const response = await this.callNvidiaApi([
      { role: 'user', content: prompt }
    ], 'meta/llama-3.1-8b-instruct');
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { type: "Other", summary: response };
    } catch (e) {
      return { type: "Other", summary: "Failed to parse AI response." };
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
    return this.callNvidiaApi(messages);
  }

  private async callNvidiaApi(messages: any[], model: string = 'nvidia/nemotron-3-super-120b-a12b'): Promise<string> {
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
}
