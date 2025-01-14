import mysql from "mysql2/promise";
import { DB_CONFIG } from "../constant.js";

const pool = mysql.createPool(DB_CONFIG);

export default pool;