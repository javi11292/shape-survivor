export const isEntity =
	<T>(type: unknown) =>
	(entity: unknown): entity is T =>
		entity !== null && typeof entity === "object" && "type" in entity && entity.type === type;
