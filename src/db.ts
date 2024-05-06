import postgres from "postgres";

require("dotenv").config();

const sql = postgres({
  host: process.env.PGHOST, // Postgres ip address[s] or domain name[s]
  port: parseInt(process.env.PGPORT ?? "5432", 10), // Postgres server port[s]
  database: process.env.PGDATABASE, // Name of database to connect to
  username: process.env.PGUSER, // Username of database user
  password: process.env.PGPASSWORD, // Password of database user
});

export default sql;
