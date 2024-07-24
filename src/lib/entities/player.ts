import { PLAYER_MASK } from "$lib/constants";
import {
	CreatePolygon,
	KeyboardEventTypes,
	PhysicsBody,
	PhysicsMotionType,
	PhysicsShapeConvexHull,
	UniversalCamera,
	Vector3,
} from "$lib/engine";
import type { Scene } from "@babylonjs/core";
import earcut from "earcut";
import { Projectile } from "./projectile";
import { SHAPE, Unit } from "./unit";

enum KEYS {
	"up" = "W",
	"down" = "S",
	"left" = "A",
	"right" = "D",
}

const keys = new Set<string>(Object.values(KEYS));

const SPEED = 0.01;
const SQRT_SPEED = Math.sqrt(Math.pow(SPEED, 2) / 2);
const PROJECTILE_POSITION = new Vector3(0, 0, 1);
const SHOT_SPEED = 1000;

const getAngle = (pointA: Vector3, pointB: Vector3) =>
	Math.atan2(pointB.x - pointA.x, pointB.z - pointA.z);

export class Player extends Unit {
	private input = new Set<KEYS>();
	private camera;
	private lastProjectile = 0;

	constructor(scene: Scene) {
		super(scene, {
			mesh: CreatePolygon(
				"player",
				{
					shape: SHAPE,
				},
				undefined,
				earcut,
			),
			body: (mesh) => new PhysicsBody(mesh, PhysicsMotionType.ANIMATED, false, scene),
		});

		this.camera = new UniversalCamera("camera", new Vector3(0, 50, 0));
		this.camera.target = new Vector3();
		this.camera.rotation.y = 0;

		this.body.shape = new PhysicsShapeConvexHull(this.mesh.sourceMesh, scene);
		this.body.shape.filterMembershipMask = PLAYER_MASK;

		scene.onPointerObservable.add(({ pickInfo }) => {
			const origin = pickInfo?.ray?.origin;

			if (!origin) {
				return;
			}

			this.mesh.rotation = this.mesh.rotation.clone();
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
				position: this.mesh.position.add(this.mesh.getDirection(PROJECTILE_POSITION)),
				rotation: this.mesh.rotation.clone(),
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
