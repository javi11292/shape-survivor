import {
	CreatePolygon,
	KeyboardEventTypes,
	UniversalCamera,
	Vector3,
	type Scene,
} from "$lib/engine";
import earcut from "earcut";
import { Unit } from "./unit";

enum KEYS {
	"up" = "W",
	"down" = "S",
	"left" = "A",
	"right" = "D",
}

const keys = new Set<string>(Object.values(KEYS));

const SPEED = 10;
const shape = [new Vector3(0, 0, 1), new Vector3(-1, 0, -1), new Vector3(1, 0, -1)];

const getAngle = (pointA: Vector3, pointB: Vector3) =>
	Math.atan2(pointB.x - pointA.x, pointB.z - pointA.z);

export class Player extends Unit {
	private input = new Set<KEYS>();
	private camera: UniversalCamera;

	constructor(scene: Scene) {
		super(scene, CreatePolygon("player", { shape }, scene, earcut));

		this.camera = new UniversalCamera("camera", new Vector3(0, 100, 0));
		this.camera.target = new Vector3(0, 0, 0);
		this.camera.rotation.y = 0;

		scene.onPointerObservable.add(({ pickInfo }) => {
			const origin = pickInfo?.ray?.origin;

			if (!origin) {
				return;
			}

			this.mesh.rotation.y = getAngle(this.mesh.position, origin);
		});

		scene.onKeyboardObservable.add(({ type, event }) => {
			switch (type) {
				case KeyboardEventTypes.KEYDOWN: {
					const key = event.key.toUpperCase();

					if (keys.has(key)) {
						this.input.add(key as KEYS);
						this.updateRotation();
					}

					break;
				}

				case KeyboardEventTypes.KEYUP: {
					const key = event.key.toUpperCase();

					if (keys.has(key)) {
						this.input.delete(key as KEYS);
						this.updateRotation();
					}

					break;
				}
			}
		});
	}

	protected render(delta: number) {
		if (this.input.size > 0) {
			this.mesh.movePOV(0, 0, SPEED * delta);
			this.camera.position.x = this.mesh.position.x;
			this.camera.position.z = this.mesh.position.z;
		}
	}

	private updateRotation() {
		if (this.input.size === 0) {
			return;
		}

		const axis: [number, number] = [0, 0];

		this.input.forEach((key) => {
			if (key === KEYS.right) {
				axis[0] = Math.PI / 2;
			} else if (key === KEYS.left) {
				axis[0] = (Math.PI * 3) / 2;
			}

			if (key === KEYS.up) {
				axis[1] = Math.PI * 2;
			} else if (key === KEYS.down) {
				axis[1] = Math.PI;
			}
		});

		if (axis[0] && axis[1]) {
			axis[1] = axis[1] / 4;
		}

		//this.mesh.rotation.z = axis[0] + axis[1];
	}
}
