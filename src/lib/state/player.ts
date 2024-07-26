import { State } from "$lib/core/utils";

const initialState = { experience: 0, level: 1, toNextLevel: 10 };

export const player = new State({ ...initialState }, () => ({ ...initialState }));
