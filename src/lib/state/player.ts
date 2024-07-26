import { State } from "$lib/core/utils";

const initialState = { experience: 0 };

export const player = new State({ ...initialState }, () => ({ ...initialState }));
