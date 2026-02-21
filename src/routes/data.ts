import { Router } from "express";
import { loadData } from "../data";
import { deriveSchema } from "../schema";
import { Field, DataType } from "../types";

const router = Router();

function castValue(value: unknown, type: DataType): string | number | boolean | null {
  if (value === null || value === undefined) return null;

  switch (type) {
    case DataType.BOOLEAN: {
      if (typeof value === "boolean") return value;
      return String(value).toLowerCase() === "true";
    }
    case DataType.INTEGER:
      return parseInt(String(value), 10);
    case DataType.FLOAT:
      return parseFloat(String(value));
    case DataType.DATE:
      return new Date(String(value)).toISOString();
    default:
      return String(value);
  }
}

function transformRow(row: Record<string, unknown>, schema: Field[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of schema) {
    result[field.name] = castValue(row[field.display], field.type);
  }
  return result;
}

function matchesFilter(
  row: Record<string, unknown>,
  where: Record<string, Record<string, unknown>>,
  schema: Field[]
): boolean {
  const fieldMap = new Map(schema.map((f) => [f.name, f]));

  for (const [fieldName, conditions] of Object.entries(where)) {
    const field = fieldMap.get(fieldName);
    if (!field) continue;

    const rawValue = row[fieldName];
    if (rawValue === null || rawValue === undefined) return false;

    for (const [op, filterValue] of Object.entries(conditions)) {
      const castedRow = castValue(rawValue, field.type);
      const castedFilter = castValue(filterValue, field.type);

      if (castedRow === null || castedFilter === null) return false;

      const a = castedRow as number;
      const b = castedFilter as number;

      switch (op) {
        case "eq":
          if (castedRow !== castedFilter) return false;
          break;
        case "gt":
          if (a <= b) return false;
          break;
        case "lt":
          if (a >= b) return false;
          break;
      }
    }
  }
  return true;
}

router.post("/", async (req, res) => {
  try {
    const data = await loadData();
    const schema = deriveSchema(data);
    const where = req.body?.where || {};

    let results = data.map((row) => transformRow(row, schema));

    if (Object.keys(where).length > 0) {
      results = results.filter((row) => matchesFilter(row, where, schema));
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

export default router;
