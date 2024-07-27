import type { Snowflake } from "discord.js";
import _db, { NAME, type MaybeDocument } from "./db";

const db = _db.database<DadOptions>(NAME);

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
                res._id,
                res._rev,
                d.cooldown,
                d.lastCall,
                d.random
            );
        }
    }
    public async update(): Promise<void> {
        const res = await db.insert(this);
        this._rev = res._rev;
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
