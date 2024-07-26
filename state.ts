import type { Snowflake } from "discord.js";
import * as fs from "fs/promises";
import * as path from "path";
import _db, { NAME } from "./db";
import type { DatabaseScope, MaybeDocument } from "nano";

const db = _db.use<DadOptions>(NAME);

const _STATEPATH: string = ((): string => {
    const p =
        process.env["STATE_PATH"] == undefined
            ? "state.json"
            : process.env["STATE_PATH"];
    if (path.isAbsolute(p)) return p;
    return path.resolve(process.cwd(), p);
})();

export interface DadOptions extends MaybeDocument {
    cooldown: number;
    lastCall: number;
    random: number;
}

export class DadState implements DadOptions {
    constructor(
        public readonly _id: string,
        public _rev: string,
        public cooldown: number,
        public lastCall: number,
        public random: number
    ) {
        //
    }
    public static async get(guild: Snowflake): Promise<DadState | null> {
        try {
            const doc = await db.get(guild);
            return new DadState(
                doc._id,
                doc._rev,
                doc.cooldown,
                doc.lastCall,
                doc.random
            );
        } catch (_e) {
            const d = defaultDadState();
            d._id = guild;
            const res = await db.insert(d);
            return new DadState(
                res.id,
                res.rev,
                d.cooldown,
                d.lastCall,
                d.random
            );
        }
    }
    public async update(): Promise<void> {
        const res = await db.insert(this);
        this._rev = res.rev;
    }
    public async destroy(): Promise<void> {
        await db.destroy(this._id, this._rev);
    }
}

function defaultDadState(): DadOptions {
    return {
        cooldown: 15 * 60 * 1000,
        lastCall: 0,
        random: 0.4,
    };
}

export async function joinGuild(guild: Snowflake) {
    const df = defaultDadState();
    df._id = guild;
    await db.insert(df);
}

export async function leaveGuild(guild: Snowflake) {
    const doc = await DadState.get(guild);
    if (doc == null) return;
    await doc.destroy();
}
