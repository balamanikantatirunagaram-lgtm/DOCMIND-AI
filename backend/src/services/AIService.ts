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

  public async chat(messages: { role: string; content: string }[]): Promise<string> {
    return this.callNvidiaApi(messages);
  }

  private async callNvidiaApi(messages: { role: string; content: string }[]): Promise<string> {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY is not set');
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'nvidia/nemotron-3-super-120b-a12b',
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
