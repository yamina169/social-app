export class AiRequestDto {
  mode?: 'summarize' | 'generate';
  text?: string;
  prompt?: string;
}
