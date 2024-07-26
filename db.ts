import nano from "nano";

const DB_URL: string = process.env["DB_URL"] || "http://127.0.0.1:5984";
const DB_NAME: string | undefined = process.env["DB_NAME"];

if (DB_NAME == undefined) {
    console.error("MISSING DATABASE NAME");
    process.exit(1);
}

const _DB = nano(DB_URL);

export const NAME: string = DB_NAME;
export default _DB.db;
