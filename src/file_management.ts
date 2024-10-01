import { parse, stringify } from "jsr:@std/csv";

export interface Entry {
    id: number;
    question: string;
    answer?: string;
    date: Date;
    likes: number;
    response_to?: number;
}

export function toCSV(posts: Entry[]): string {
    return stringify(posts, {
      columns: ['id', 'question', 'answer', 'date', 'likes', 'response_to'],
    });
}

export function toEntries(text: string): Entry[] {
  return parse(text, {
    skipFirstRow: true,
    strip: true,
  });
}