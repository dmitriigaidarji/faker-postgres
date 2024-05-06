import {
  getTableColumns,
  InsertOptions,
  insertValuesIntoTableWithOptions,
} from "./utils";

function processTable(table: string, options: InsertOptions) {
  return getTableColumns(table).then((columns) => {
    return insertValuesIntoTableWithOptions({
      table,
      columns,
      options,
    });
  });
}
async function main() {
  const amount = 1000;
  const sites = await processTable("sites", { amount });

  const investigations = await processTable("investigations", { amount });

  const i_keys = [
    "pr_id",
    "responsible_person",
    "investigator",
    "sqa_contact",
    "site_qa_approval_by",
    "area_manager",
  ];
  const roles = [
    "RESPONSIBLE_FOR",
    "INVESTIGATOR",
    "SQA_CONTACT_FOR",
    "SQA_APPROVER_FOR",
    "AREA_MANAGER",
  ];

  // validate
  i_keys.forEach((key) => {
    if (investigations[0][key] === undefined) {
      throw `${investigations[0]} has no ${key} key`;
    }
  });

  await processTable("investigation_persons", {
    amount,
    overwrite: [
      {
        column: "inv_role",
        values: roles,
      },
      {
        column: "pr_id",
        values: investigations.map((t) => t.pr_id),
        spliceOnLoop: true,
      },
    ],
  });

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
    ],
  });

  await processTable("capa_persons", {
    amount,
    overwrite: [
      {
        column: "capa_pr_id",
        values: capas.map((t) => t.capa_pr_id),
        spliceOnLoop: true,
      },
      {
        column: "capa_role",
        values: ["RESPONSIBLE_FOR", "SQA_APPROVER_FOR"],
      },
    ],
  });
}

main().then((e) => {
  console.log(e);
  process.exit(0);
});
