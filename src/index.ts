import {
  getTableColumns,
  InsertOptions,
  insertValuesIntoTableWithOptions,
} from "./utils";
// import sql from "./db";

// function getPeople() {
//   return sql<[{ name: string }]>`SELECT distinct name from persons`.then((t) =>
//     t.map((n) => n.name).flat(),
//   );
// }

function processTable(table: string, options: InsertOptions) {
  return getTableColumns(table).then((columns) => {
    return insertValuesIntoTableWithOptions({
      table,
      columns: columns.filter((t) => t.column_name !== "id"),
      options,
    });
  });
}

async function doInvestigations({
  amount,
  people,
}: {
  amount: number;
  people: any[];
}) {
  const investigations = await processTable("investigations", {
    amount,
    overwrite: [
      {
        column: "responsible_person",
        values: people,
      },
      {
        column: "investigator",
        values: people,
      },
      {
        column: "sqa_contact",
        values: people,
      },
      {
        column: "site_qa_approval_by",
        values: people,
      },
      {
        column: "area_manager",
        values: people,
      },
    ],
  });

  // await processTable("investigation_persons", {
  //   amount,
  //   overwrite: [
  //     {
  //       column: "inv_role",
  //       values: [
  //         "RESPONSIBLE_FOR",
  //         "INVESTIGATOR",
  //         "SQA_CONTACT_FOR",
  //         "SQA_APPROVER_FOR",
  //         "AREA_MANAGER",
  //       ],
  //     },
  //     {
  //       column: "pr_id",
  //       values: investigations.map((t) => t.pr_id),
  //       spliceOnLoop: true,
  //     },
  //   ],
  // });

  return investigations;
}
async function doCapas({
  amount,
  people,
  investigations,
}: {
  amount: number;
  people: any[];
  investigations: any[];
}) {
  const sites = await processTable("sites", { amount });

  const capas = await processTable("capas", {
    amount,
    overwrite: [
      {
        column: "inv_pr_id",
        values: investigations.map((t) => t.pr_id),
      },
      {
        column: "division_id",
        values: sites.map((t) => t.division_id),
      },
      {
        column: "responsible_person",
        values: people,
      },
      {
        column: "site_qa_approval_by",
        values: people,
      },
    ],
  });

  // await processTable("capa_persons", {
  //   amount,
  //   overwrite: [
  //     {
  //       column: "capa_pr_id",
  //       values: capas.map((t) => t.capa_pr_id),
  //       spliceOnLoop: true,
  //     },
  //     {
  //       column: "capa_role",
  //       values: ["RESPONSIBLE_FOR", "SQA_APPROVER_FOR"],
  //     },
  //   ],
  // });
}
async function main() {
  const amount = 100000;
  // const people = await getPeople();
  const people = await processTable("persons", { amount });

  const investigations = await doInvestigations({ amount, people });
  await doCapas({ amount, people, investigations });
}
main().then((e) => {
  console.log(e);
  process.exit(0);
});
