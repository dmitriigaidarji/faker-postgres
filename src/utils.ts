import sql from "./db";
import { faker } from "@faker-js/faker";

type IDataType = "character varying" | "timestamp without time zone";

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

function getValueForDataType(type: IDataType, max_size: number | null) {
  switch (type) {
    case "character varying":
      return faker.string
        .uuid()
        .slice(0, max_size ? Math.floor(max_size / 4) : 10);
    case "timestamp without time zone":
      return faker.date.past();
    default:
      throw "Unknown data type: " + type;
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
  return sql`
    insert into ${sql(table)} ${sql(values)}
    `.then((r) => values);
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
  const values: any[] = [];
  for (let i = 0; i < options.amount; i++) {
    const value: any = {};
    columns.forEach(({ column_name, data_type, max_size }) => {
      value[column_name] = getValueForDataType(data_type, max_size);
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
