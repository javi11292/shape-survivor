import { State } from "$lib/core/utils";

const initialState = { hp: 10, maxHp: 10, experience: 0, level: 1, toNextLevel: 10 };

export const player = new State({ ...initialState }, () => ({ ...initialState }));
