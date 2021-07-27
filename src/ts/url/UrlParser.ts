export function isArgumentatedUrl(url: string): boolean {
    //This regex could probably be made more efficient, but it's called once
    // eslint-disable-next-line security/detect-unsafe-regex
    const urlRegex = /^.*\/pos:(\d+,){2}\d+/u;
    const matches = url.match(urlRegex);
    return matches != null;
}
