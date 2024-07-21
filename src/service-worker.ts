/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, version } from "$service-worker";

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `cache-${version}`;
const assets = new Set(build);

sw.addEventListener("install", (event) => {
	const addCache = async () => {
		const cache = await caches.open(CACHE);
		await cache.addAll(assets);
	};

	event.waitUntil(addCache());
});

sw.addEventListener("activate", (event) => {
	const deleteCache = async () => {
		await sw.clients.claim();

		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	};

	event.waitUntil(deleteCache());
});

sw.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") {
		return;
	}

	const url = new URL(event.request.url);

	if (!assets.has(url.pathname)) {
		return;
	}

	const getResponse = async () => {
		const cache = await caches.open(CACHE);
		const response = await cache.match(event.request);

		return response || fetch(event.request);
	};

	event.respondWith(getResponse());
});
