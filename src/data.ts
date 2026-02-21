import fs from "fs";
import path from "path";

const DATA_URL = "https://app-media.noloco.app/noloco/dublin-bikes.json";
const LOCAL_PATH = path.join(__dirname, "..", "dublin_bikes_data_set.json");

let cachedData: Record<string, unknown>[] | null = null;

async function fetchRemote(): Promise<Record<string, unknown>[]> {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
  return (await res.json()) as Record<string, unknown>[];
}

function loadLocal(): Record<string, unknown>[] {
  const raw = fs.readFileSync(LOCAL_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function loadData(): Promise<Record<string, unknown>[]> {
  if (cachedData) return cachedData;

  try {
    cachedData = await fetchRemote();
  } catch {
    cachedData = loadLocal();
  }

  return cachedData;
}
