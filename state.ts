import type { Snowflake } from "discord.js";
import * as fs from "fs/promises";
import * as path from "path";

const _STATEPATH: string = ((): string => {
    const p =
        process.env["STATE_PATH"] == undefined
            ? "state.json"
            : process.env["STATE_PATH"];
    if (path.isAbsolute(p)) return p;
    return path.resolve(process.cwd(), p);
})();

export interface DadState {
    cooldown: number;
    lastCall: number;
    random: number;
}

let _DADSTATE: { [key: Snowflake]: DadState } = {};

function defaultDadState(): DadState {
    return {
        cooldown: 15 * 60 * 1000,
        lastCall: 0,
        random: 0.4,
    };
}

export async function saveState() {
    await fs.writeFile(_STATEPATH, JSON.stringify(_DADSTATE));
}

export function getState(guild: Snowflake): DadState {
    if (_DADSTATE[guild] == undefined) _DADSTATE[guild] = defaultDadState();
    return _DADSTATE[guild];
}

export async function joinGuild(guild: Snowflake) {
    _DADSTATE[guild] = defaultDadState();
    await saveState();
}

export async function leaveGuild(guild: Snowflake) {
    delete _DADSTATE[guild];
    await saveState();
}

export async function loadState() {
    if (await fs.exists(_STATEPATH)) {
        // Load from file.
        _DADSTATE = JSON.parse(
            await fs.readFile(_STATEPATH, { encoding: "utf-8" })
        ) as { [key: Snowflake]: DadState };
    } else {
        // No state file. Write it and return the default.
        await saveState();
    }
}
