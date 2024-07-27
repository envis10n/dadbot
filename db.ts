import axios, { type AxiosInstance } from "axios";

export interface DocumentBase {
    _id: string;
    _rev: string;
}

export type MaybeDocument = Partial<DocumentBase>;

export interface DocumentResponse {
    _id: string;
    _rev: string;
    _deleted?: boolean;
    _attachments?: { [key: string]: any };
    _conflicts?: string[];
    _deleted_conflicts?: string[];
    _local_seq?: string;
    _revs_info?: {}[];
    _revisions?: {};
}

export interface DocumentListResponse<T extends MaybeDocument> {
    total_rows: number;
    offset: number;
    rows: T[];
}

export interface SessionInitResponse {
    ok: boolean;
    name: string;
    roles: string[];
}

export interface DocumentInsertResponse {
    id: string;
    ok: boolean;
    rev: string;
}

export class CouchDB {
    private _ax: AxiosInstance;
    private _auth: boolean = false;
    constructor(url: string) {
        this._ax = axios.create({
            baseURL: url,
            headers: {
                Accept: "application/json",
            },
        });
    }
    public async cookieAuth(
        name: string,
        password: string
    ): Promise<SessionInitResponse> {
        const res = await this._ax.post<SessionInitResponse>("/_session", {
            name,
            password,
        });
        if (res.data.ok == true) {
            const cookie = res.headers["set-cookie"];
            if (cookie == undefined) throw new Error("No cookie to set.");
            this._ax.defaults.headers.cookie = cookie[0];
            return res.data;
        } else {
            return res.data;
        }
    }
    public database<T extends MaybeDocument>(name: string): Database<T> {
        return new Database(this._ax, name);
    }
}

export class Database<T extends MaybeDocument> {
    private _ax: AxiosInstance;
    private _name: string;
    constructor(ax: AxiosInstance, name: string) {
        const df = Object.assign({}, ax.defaults);
        df.baseURL = `${df.baseURL}/${name}`;
        this._ax = axios.create(df);
        this._name = name;
    }
    public async list(): Promise<DocumentListResponse<T>> {
        const res = await this._ax.get<DocumentListResponse<T>>("/_all_docs");
        return res.data;
    }
    public async get(id: string): Promise<T & DocumentResponse> {
        const res = await this._ax.get<T & DocumentResponse>(`/${id}`);
        return res.data;
    }
    public async insert(doc: T): Promise<T & DocumentBase> {
        if (doc._id != undefined) {
            const res = await this._ax.put<DocumentInsertResponse>(
                `/${doc._id}`,
                doc
            );
            doc._rev = res.data.rev;
        } else {
            const res = await this._ax.post<DocumentInsertResponse>("", doc);
            doc._rev = res.data.rev;
            doc._id = res.data.id;
        }
        return doc as T & DocumentBase;
    }
    public async destroy(id: string, rev: string): Promise<boolean> {
        const res = await this._ax.delete<DocumentInsertResponse>(
            `/${id}?rev=${rev}`
        );
        return res.data.ok;
    }
}

const DB_URL: string = process.env["DB_URL"] || "http://127.0.0.1:5984";
const DB_NAME: string | undefined = process.env["DB_NAME"];
const DB_USER: string | undefined = process.env["DB_USER"];
const DB_PASSWORD: string | undefined = process.env["DB_PASSWORD"];

if (DB_NAME == undefined) {
    console.error("MISSING DATABASE NAME");
    process.exit(1);
}

if (DB_USER == undefined || DB_PASSWORD == undefined) {
    console.error("MISSING DB CREDENTIALS");
    process.exit(1);
}

export const _DB = new CouchDB(DB_URL);

await _DB.cookieAuth(DB_USER, DB_PASSWORD);

export const NAME: string = DB_NAME;
export default _DB;
