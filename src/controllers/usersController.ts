import { Request, Response } from "express";
import { Readable } from "stream";
import csv from "csv-parser";
import Joi from "joi";
import pool from "../config/pgPool";

const fileDataScehma = Joi.array()
  .items(
    Joi.object({
      id: Joi.string().required(),
      login: Joi.string().required(),
      name: Joi.string().required(),
      salary: Joi.number().required(),
    })
  )
  .unique((a, b) => a.id === b.id || a.login === b.login);

const uploadFile = async (
  req: Request,
  res: Response
): Promise<Response<any> | undefined> => {
  try {
    const client = await pool.connect();
    await client.query("BEGIN");
    if (!req.file) {
      return res.status(400).json({
        message: "no file found",
      });
    }

    const csvStream = Readable.from(
      Buffer.from(req.file.buffer)
        .toString()
        .split("\n")
        .filter((str: string) => str[0] !== "#")
        .join("\n")
    );
    let results: any = [];

    csvStream
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", async () => {
        const validationResults = fileDataScehma.validate(results);
        if (validationResults.error) {
          console.log(validationResults);
          return res.status(400).json({
            status: "fail",
            message: "Invalid file data",
            data: validationResults.error,
          });
        }

        let query = "INSERT INTO employees (id, login, salary, name) VALUES ";
        let values: any = [];

        let count = 1;
        query += results
          .map(
            (employee: any) =>
              `($${count++},$${count++},$${count++},$${count++})`
          )
          .join(",");
        results.forEach(
          (employee: {
            id: string;
            login: string;
            salary: string;
            name: string;
          }) => {
            values.push(employee.id);
            values.push(employee.login);
            values.push(employee.salary);
            values.push(employee.name);
          }
        );
        query +=
          " ON CONFLICT (id) DO UPDATE SET (login, salary, name) = (EXCLUDED.login, EXCLUDED.salary, EXCLUDED.name)";
        console.log(query, values);

        try {
          await client.query(query, values);
          await client.query("COMMIT");
          return res.status(200).json({
            status: "success",
            message: "OK",
            data: results,
            meta: null,
          });
        } catch (e) {
          await client.query("ROLLBACK");
          res.status(400).json({
            status: "fail",
            message: "request data conflicts with table constraints",
            data: e,
          });
        } finally {
          client.release();
          return;
        }
      });

    return;
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "internal server error",
      data: err,
    });
  }
};

const getUsersParamsSchema = Joi.object({
  minSalary: Joi.number().min(0).required(),
  maxSalary: Joi.number().greater(Joi.ref("minSalary")).required(),
  offset: Joi.number().integer().min(0).required(),
  limit: Joi.number().integer().min(0).required(),
  sort: Joi.string().allow().required(),
});

const getUsers = async (
  req: Request,
  res: Response
): Promise<Response<any> | undefined> => {
  try {
    const validationResults = getUsersParamsSchema.validate(req.query);

    if (validationResults.error) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid params",
        data: validationResults.error,
      });
    }

    const { minSalary, maxSalary, offset, limit, sort } =
      validationResults.value;

    let query = "SELECT * FROM employees WHERE salary between $1 AND $2";
    let values = [minSalary, maxSalary, limit, offset];

    //validate sort
    let orderBy;
    if (sort[0] === " ") {
      orderBy = "ASC";
    } else if (sort[0] === "-") {
      orderBy = "DESC";
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Invalid sort. First character should be '+' or '-'",
        data: validationResults.value,
      });
    }
    // valid sort values
    const validSort = ["id", "name", "login", "salary"];
    const sortCol = sort.substring(1).trim();
    if (!validSort.includes(sortCol)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid sort column. Only 'id', 'name', 'login', 'salary'.",
        data: validationResults.value,
      });
    }

    query += ` ORDER BY ${sortCol} ${orderBy} LIMIT $3 OFFSET $4`;

    const client = await pool.connect();
    console.log(query, values);
    const results = await client.query(query, values);
    client.release();
    return res.status(200).json({
      results: results.rows,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "internal server error",
      data: err,
    });
  }
};

const usersController = {
  uploadFile,
  getUsers,
};

export default usersController;
