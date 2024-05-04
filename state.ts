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
}

let _DADSTATE: { [key: Snowflake]: DadState } = {};

function defaultDadState(): DadState {
    return {
        cooldown: 15 * 60 * 1000,
        lastCall: 0,
    };
}

async function saveState() {
    await fs.writeFile(_STATEPATH, JSON.stringify(_DADSTATE));
}

export function get_cooldown(guild: Snowflake): number {
    if (_DADSTATE[guild] == undefined) _DADSTATE[guild] = defaultDadState();
    const gstate = _DADSTATE[guild];
    return gstate.cooldown;
}

export async function set_cooldown(guild: Snowflake, v: number) {
    if (_DADSTATE[guild] == undefined) _DADSTATE[guild] = defaultDadState();
    const gstate = _DADSTATE[guild];
    gstate.cooldown = v;
    await saveState();
}

export function get_lastCall(guild: Snowflake): number {
    if (_DADSTATE[guild] == undefined) _DADSTATE[guild] = defaultDadState();
    const gstate = _DADSTATE[guild];
    return gstate.lastCall;
}

export async function set_lastCall(guild: Snowflake, v: number) {
    if (_DADSTATE[guild] == undefined) _DADSTATE[guild] = defaultDadState();
    const gstate = _DADSTATE[guild];
    gstate.lastCall = v;
    await saveState();
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
