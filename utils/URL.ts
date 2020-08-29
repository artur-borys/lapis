export function removeSlashDoubles(url: string) {
  return url.replaceAll(/\/{2,}/ig, "/");
}

export function removeTrailingSlash(url: string) {
  if (url.length > 1) {
    if (url.endsWith("/")) {
      return url.slice(0, -1);
    }
  }
  return url;
}

export function sanitize(url: string) {
  return removeTrailingSlash(removeSlashDoubles(url)).toLowerCase();
}

export function matchPath(candidate: string, target: string): boolean {
  /* For now, only check if equal
  TODO:
    - match with parameters like /user/:id
  */
  return sanitize(candidate) === sanitize(target);
}
