import { camelCase } from "lodash";
import { DataType, Field } from "./types";

const OPTION_THRESHOLD = 10;

function isBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return true;
  if (typeof value === "string") {
    return ["true", "false"].includes(value.toLowerCase());
  }
  return false;
}

function isDate(value: unknown): boolean {
  if (typeof value !== "string") return false;
  // avoid treating plain numbers as dates
  if (/^\d+(\.\d+)?$/.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

function isInteger(value: unknown): boolean {
  if (typeof value === "number") return Number.isInteger(value);
  if (typeof value === "string") return /^-?\d+$/.test(value.trim());
  return false;
}

function isFloat(value: unknown): boolean {
  if (typeof value === "number") return true;
  if (typeof value === "string") return /^-?\d+\.\d+$/.test(value.trim());
  return false;
}

function inferType(values: unknown[]): DataType {
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "");
  if (nonNull.length === 0) return DataType.TEXT;

  if (nonNull.every(isBoolean)) return DataType.BOOLEAN;
  if (nonNull.every(isDate)) return DataType.DATE;
  if (nonNull.every(isInteger)) return DataType.INTEGER;
  if (nonNull.every(isFloat)) return DataType.FLOAT;

  return DataType.TEXT;
}

function isOption(values: unknown[], type: DataType): string[] | null {
  if (type !== DataType.TEXT) return null;

  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "");
  const unique = [...new Set(nonNull.map(String))];

  if (unique.length > 0 && unique.length <= OPTION_THRESHOLD) {
    return unique.sort();
  }
  return null;
}

export function deriveSchema(data: Record<string, unknown>[]): Field[] {
  if (data.length === 0) return [];

  const keys = Object.keys(data[0]);

  return keys.map((key) => {
    const values = data.map((row) => row[key]);
    const type = inferType(values);
    const options = isOption(values, type);

    return {
      display: key,
      name: camelCase(key),
      type: options ? DataType.OPTION : type,
      options: options || [],
    };
  });
}
