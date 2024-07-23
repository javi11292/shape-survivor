import { PLAYER_MASK } from "$lib/constants";
import { KeyboardEventTypes, UniversalCamera, Vector3, type Scene } from "$lib/engine";
import { Projectile } from "./projectile";
import { Unit } from "./unit";

enum KEYS {
	"up" = "W",
	"down" = "S",
	"left" = "A",
	"right" = "D",
}

const keys = new Set<string>(Object.values(KEYS));

const SPEED = 10;
const SQRT_SPEED = Math.sqrt(Math.pow(SPEED, 2) / 2);
const PROJECTILE_POSITION = new Vector3(0, 0, 1);
const PROJECTILE_PIVOT = new Vector3(0, 0, -1);
const SHOT_SPEED = 1;

const getAngle = (pointA: Vector3, pointB: Vector3) =>
	Math.atan2(pointB.x - pointA.x, pointB.z - pointA.z);

export class Player extends Unit {
	private input = new Set<KEYS>();
	private camera;
	private lastProjectile = 0;

	constructor(scene: Scene) {
		super(scene, { name: "player" });

		this.mesh.collisionGroup = PLAYER_MASK;
		this.camera = new UniversalCamera("camera", new Vector3(0, 50, 0));
		this.camera.target = new Vector3();
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
					}

					break;
				}

				case KeyboardEventTypes.KEYUP: {
					const key = event.key.toUpperCase();

					if (keys.has(key)) {
						this.input.delete(key as KEYS);
					}

					break;
				}
			}
		});
	}

	protected render(delta: number) {
		this.lastProjectile += delta;

		if (this.lastProjectile >= SHOT_SPEED) {
			new Projectile(this.scene, {
				position: this.mesh.position.add(PROJECTILE_POSITION),
				rotation: this.mesh.rotation.clone(),
				pivot: PROJECTILE_PIVOT,
			});

			this.lastProjectile -= SHOT_SPEED;
		}

		if (this.input.size > 0) {
			const position = new Vector3();

			this.input.forEach((key) => {
				switch (key) {
					case KEYS.right:
						position.x = 1;
						break;
					case KEYS.left:
						position.x = -1;
						break;
					case KEYS.up:
						position.z = 1;
						break;
					case KEYS.down:
						position.z = -1;
						break;
				}
			});

			const speed = (position.x && position.z ? SQRT_SPEED : SPEED) * delta;

			this.mesh.position.addInPlace(position.scale(speed));
			this.camera.position.x = this.mesh.position.x;
			this.camera.position.z = this.mesh.position.z;
		}
	}

	get position() {
		return this.mesh.position;
	}
}
