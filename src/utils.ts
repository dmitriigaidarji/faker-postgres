import sql from "./db";
import { faker } from "@faker-js/faker";

type IDataType =
  | "character varying"
  | "timestamp without time zone"
  | "integer"
  | "bigint"
  | "boolean";

interface ITableColumns {
  column_name: string;
  data_type: IDataType;
  max_size: number | null;
}

export function getTableColumns(table: string) {
  return sql<[ITableColumns]>`
    SELECT
    column_name,
    data_type,
    character_octet_length as max_size
FROM
    information_schema.columns
WHERE
    table_name = ${table};
  `;
}
const personNameKeys = [
  "responsible_person",
  "investigator",
  "sqa_contact",
  "site_qa_approval_by",
  "area_manager",
];
function getValueForDataType({
  data_type,
  column_name,
  max_size,
}: ITableColumns) {
  switch (data_type) {
    case "character varying":
      if (personNameKeys.includes(column_name)) {
        return faker.person
          .fullName()
          .slice(0, max_size ? Math.floor(max_size / 4) : 100);
      }
      return faker.string
        .uuid()
        .slice(0, max_size ? Math.floor(max_size / 4) : 100);
    case "timestamp without time zone":
      return faker.date.past();
    case "integer":
    case "bigint":
      return faker.number.int({
        max: 999999,
      });
    case "boolean":
      return Math.random() > 0.5;
    default:
      throw "Unknown data type: " + data_type;
  }
}

export type InsertOptions = {
  amount: number;
  overwrite?: {
    column: string;
    values: string[];
    spliceOnLoop?: boolean;
  }[];
};

export async function insertValuesIntoTable({
  table,
  values,
}: {
  table: string;
  values: any[];
}) {
  const copied = values.slice();
  while (copied.length > 0) {
    console.log("left to insert", table, copied.length);
    const toInsert = copied.splice(0, 1000);
    await sql`
    insert into ${sql(table)} ${sql(toInsert)}
    `;
  }
  return values;
}

export async function insertValuesIntoTableWithOptions({
  table,
  columns,
  options,
}: {
  table: string;
  columns: ITableColumns[];
  options: InsertOptions;
}) {
  console.log("insertValuesIntoTableWithOptions", table);
  const values: any[] = [];
  for (let i = 0; i < options.amount; i++) {
    const value: any = {};
    columns.forEach((c) => {
      value[c.column_name] = getValueForDataType(c);
    });
    if (options.overwrite) {
      for (const {
        column,
        values: overwriteValues,
        spliceOnLoop,
      } of options.overwrite) {
        const i = faker.number.int({
          min: 0,
          max: overwriteValues.length - 1,
        });
        const el = overwriteValues[i];
        value[column] = el;
        if (spliceOnLoop) {
          overwriteValues.splice(i, 1);
        }
      }
    }

    values.push(value);
  }

  return insertValuesIntoTable({
    table,
    values,
  });
}
