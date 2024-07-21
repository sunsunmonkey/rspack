/**
 * The following code is from
 * https://github.com/webpack/loader-runner
 *
 * MIT Licensed
 * Author Tobias Koppers @sokra
 * Copyright (c) JS Foundation and other contributors
 * https://github.com/webpack/loader-runner/blob/main/LICENSE
 */
import { LoaderObject } from ".";
import LoaderLoadingError from "./LoaderLoadingError";
import { URL, pathToFileURL } from "node:url";

let url: typeof URL | undefined;

export default async function loadLoader(loader: LoaderObject) {
	if (loader.type === "module") {
		try {
			if (url === undefined) url = URL;
			const loaderUrl = pathToFileURL(loader.path);
			const modulePromise = eval(
				`import(${JSON.stringify(loaderUrl.toString())})`
			) as Promise<any>;
			modulePromise.then(module => {
				handleResult(loader, module);
			});
			return;
		} catch (e) {
			throw e;
		}
	} else {
		try {
			const module = await import(loader.path);
			return handleResult(loader, module);
		} catch (e) {
			if (e instanceof Error && (e as any).code === "EMFILE") {
				const retry: any = loadLoader.bind(null, loader);
				if (typeof setImmediate === "function") {
					// node >= 0.9.0
					return setImmediate(retry);
				} else {
					// node < 0.9.0
					return process.nextTick(retry);
				}
			}
			throw e;
		}
	}
}

function handleResult(loader: LoaderObject, module: any) {
	if (typeof module !== "function" && typeof module !== "object") {
		throw new LoaderLoadingError(
			`Module '${loader.path}' is not a loader (export function or es6 module)`
		);
	}
	loader.normal = typeof module === "function" ? module : module.default;
	loader.pitch = module.pitch;
	loader.raw = module.raw;
	if (
		typeof loader.normal !== "function" &&
		typeof loader.pitch !== "function"
	) {
		throw new LoaderLoadingError(
			`Module '${loader.path}' is not a loader (must have normal or pitch function)`
		);
	}
}
