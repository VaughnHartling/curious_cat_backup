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

export async function getLastId(file: string): Promise<number | string | undefined> {
    try {
        const text = await Deno.readTextFile(file);
        const entries = toEntries(text);
        return entries[entries.length - 1].id;
    } catch (e) {
        return undefined;
    }
}

export async function writeToFile(file: string, entries: Entry[]) {
  let previousEntries: Entry[];
  try {
    previousEntries = toEntries(await Deno.readTextFile(file));
  } catch (e) {
    previousEntries = [];
  }
  let text = toCSV(previousEntries.concat(entries));
  await Deno.writeTextFile(file, text);
}