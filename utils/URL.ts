import type { QueryOrParams } from "../request.ts";

/**
 * Removes slash repetitions from the url. Ex. //some/path///string// -> /some/path/string/
 * @param {string} url the url
 * @returns {string} url withour repetitions
 */
export function removeSlashDoubles(url: string): string {
  return url.replaceAll(/\/{2,}/ig, "/");
}

/**
 * Removes trailing slash from url, ex. /some/path/ -> /some/path
 * @param {string} url the url
 * @returns {string} url without trailing slash
 */
export function removeTrailingSlash(url: string): string {
  if (url.length > 1) {
    if (url.endsWith("/")) {
      return url.slice(0, -1);
    }
  }
  return url;
}

/**
 * Applies {@link removeSlashDoubles} and {@link removeTrailingSlash} on the url
 * @param url the url
 * @returns {string} modified url
 */
export function sanitize(url: string): string {
  return removeTrailingSlash(removeSlashDoubles(url)).toLowerCase();
}

/**
 * Checks whether request url matches url from router (model url) if it has params
 * @param {string} requestUrl
 * @param {string} modelUrl
 * @returns {boolean}
 */
export function matchWithParams(requestUrl: string, modelUrl: string): boolean {
  const modelParts = modelUrl.split("/");
  const requestParts = requestUrl.split("/");
  if (modelParts.length !== requestParts.length) {
    return false;
  }
  for (let i = 0; i < modelParts.length; i++) {
    if (modelParts[i].startsWith(":")) {
      continue;
    }
    if (modelParts[i] !== requestParts[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Checks whether model url contains params
 * @param url
 * @returns {boolean}
 */
export function hasParams(url: string): boolean {
  return /:/.test(url);
}

/**
 * Extracts parameters from given requestUrl based on modelUrl
 * @param requestUrl 
 * @param modelUrl 
 * @returns {QueryOrParams}
 */
export function extractParams(
  requestUrl: string,
  modelUrl: string,
): QueryOrParams {
  let params: QueryOrParams = {};
  if (hasParams(modelUrl) && matchWithParams(requestUrl, modelUrl)) {
    const modelParts = modelUrl.split("/");
    const requestParts = requestUrl.split("?")[0].split("/");
    for (let i = 0; i < modelParts.length; i++) {
      if (modelParts[i].startsWith(":")) {
        const name = modelParts[i].slice(1);
        const value = requestParts[i];
        params[name] = value;
      }
    }
  }
  return params;
}

/**
 * Checks whether request url matches url from router (model url)
 * @param requestUrl the request url
 * @param modelUrl the model url
 * @returns {boolean}
 */
export function matchPath(requestUrl: string, modelUrl: string): boolean {
  /* For now, only check if equal
  TODO:
    - match with parameters like /user/:id
  */
  modelUrl = sanitize(modelUrl);
  const noQueryString = sanitize(requestUrl.split("?")[0]);
  if (hasParams(modelUrl)) {
    return matchWithParams(noQueryString, modelUrl);
  } else {
    // only middleware can have * in path so we don't have to look for params
    if (modelUrl.endsWith("*")) {
      return noQueryString.startsWith(modelUrl.slice(0, -2));
    } else {
      return noQueryString === modelUrl;
    }
  }
}
