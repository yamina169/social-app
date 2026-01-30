import { Article } from './article.types';

export interface IArticlesResponse {
  articles: Article[]; // ← ici on met bien un tableau

  articlesCount: number;
}
