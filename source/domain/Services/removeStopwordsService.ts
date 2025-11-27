import { stopwords } from "../Enums/StopWords";

export default async function RemoveStopWordsService(
  text: string,
  lang: string = "por"
): Promise<string> {
  const words = text.split(/\s+/);
  const selectedStopwords = stopwords[lang] || [];
  const filtered = words.filter((word) => !selectedStopwords.includes(word.toLowerCase()));
  return filtered.join(" ");
}
