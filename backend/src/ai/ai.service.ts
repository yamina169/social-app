import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { AiRequestDto } from './dto/AiRequest.dto';

@Injectable()
export class AiService {
  private readonly baseUrl: string;

  constructor() {
    // Nom du service Docker ou variable d'environnement
    this.baseUrl = 'http://localai:8081';
  }

  // Générer ou résumer selon le mode
  async handleRequest(dto: AiRequestDto, maxTokens = 300): Promise<string> {
    const { mode, prompt, text } = dto;

    if (!prompt && !text) {
      throw new HttpException(
        'Prompt or text is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Déterminer le contenu à envoyer
    const input = mode === 'summarize' ? text : prompt;

    if (!input) {
      throw new HttpException(
        'Invalid input for the selected mode',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const response = await axios.post(`${this.baseUrl}/v1/completions`, {
        model: 'gpt2', // modèle à utiliser, assure-toi qu'il est dans /models
        prompt: input,
        max_tokens: maxTokens,
      });

      return response.data?.choices?.[0]?.text ?? '';
    } catch (err: any) {
      console.error('AI service error:', err.message || err);
      throw new HttpException(
        'AI service failed. Check if LocalAI container is running and accessible.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Helper spécifique pour résumer
  async summarizeText(text: string, maxTokens = 150): Promise<string> {
    return this.handleRequest({ mode: 'summarize', text }, maxTokens);
  }

  // Helper spécifique pour générer
  async generateText(prompt: string, maxTokens = 300): Promise<string> {
    return this.handleRequest({ mode: 'generate', prompt }, maxTokens);
  }
}
