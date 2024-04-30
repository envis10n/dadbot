import * as fs from "fs/promises";
import * as path from "path";

const _STATEPATH: string = ((): string => {
    const p = (process.env["STATE_PATH"] == undefined ? "state.json" : process.env["STATE_PATH"]);
    if (path.isAbsolute(p)) return p;
    return path.resolve(process.cwd(), p);
})();

export interface DadState {
    cooldown: number;
    lastCall: number;
}

let _DADSTATE: DadState = {
    cooldown: 15 * 60 * 1000,
    lastCall: 0
};

async function saveState() {
    await fs.writeFile(_STATEPATH, JSON.stringify(_DADSTATE));
}

export function get_cooldown(): number {
    return _DADSTATE.cooldown;
}

export async function set_cooldown(v: number) {
    _DADSTATE.cooldown = v;
    await saveState();
}

export function get_lastCall(): number {
    return _DADSTATE.lastCall;
}

export async function set_lastCall(v: number) {
    _DADSTATE.lastCall = v;
    await saveState();
}

export async function loadState() {
    if (await fs.exists(_STATEPATH)) {
        // Load from file.
        _DADSTATE = JSON.parse(await fs.readFile(_STATEPATH, {encoding: "utf-8"})) as DadState;
    } else {
        // No state file. Write it and return the default.
        await saveState();
    }
}