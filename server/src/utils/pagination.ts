import { query } from '../config/database';

export interface PaginateInput {
  select: string;
  from: string;
  where?: string;
  whereParams?: any[];
  orderBy: string;
  page: number;
  limit: number;
}

export interface PaginateResult<T> {
  rows: T[];
  total: number;
}

export async function paginate<T = any>({
  select,
  from,
  where = '',
  whereParams = [],
  orderBy,
  page,
  limit,
}: PaginateInput): Promise<PaginateResult<T>> {
  const offset = (page - 1) * limit;
  const limitIdx = whereParams.length + 1;
  const offsetIdx = whereParams.length + 2;

  const dataSql = `SELECT ${select} FROM ${from} ${where} ORDER BY ${orderBy} LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
  const countSql = `SELECT COUNT(*) AS total FROM ${from} ${where}`;

  const [dataResult, countResult] = await Promise.all([
    query(dataSql, [...whereParams, limit, offset]),
    query(countSql, whereParams),
  ]);

  return {
    rows: dataResult.rows,
    total: parseInt(countResult.rows[0].total, 10),
  };
}
