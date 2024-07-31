export const isEntity =
	<T>(type: unknown) =>
	(metadata: unknown): metadata is T =>
		metadata !== null &&
		typeof metadata === "object" &&
		"type" in metadata &&
		metadata.type === type;
