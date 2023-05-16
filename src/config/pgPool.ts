import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "esm-db",
  password: "P@ssw0rd123!",
  port: 5432,
});

export default pool;
