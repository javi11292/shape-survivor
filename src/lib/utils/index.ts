import { player } from "$lib/state/player";

export const isEntity =
	<T>(type: unknown) =>
	(metadata: unknown): metadata is T =>
		metadata !== null &&
		typeof metadata === "object" &&
		"type" in metadata &&
		metadata.type === type;

export const getTime = () =>
	`${Math.floor(player.time / 1000 / 60)}:${Math.round((player.time / 1000) % 60)
		.toString()
		.padStart(2, "0")}`;
