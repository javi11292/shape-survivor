import type { ComponentProps } from "svelte";
import UI from "./ui.svelte";

export { UI };

export type Position = { position: ComponentProps<typeof UI>["position"] };
