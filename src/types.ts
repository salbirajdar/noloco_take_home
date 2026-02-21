export enum DataType {
  TEXT = "TEXT",
  INTEGER = "INTEGER",
  FLOAT = "FLOAT",
  DATE = "DATE",
  BOOLEAN = "BOOLEAN",
  OPTION = "OPTION",
}

export interface Field {
  display: string;
  name: string;
  type: DataType;
  options: string[];
}
