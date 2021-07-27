export function isArgumentatedUrl(url: string): boolean {
    //This regex could probably be made more efficient, but it's called once
    const urlRegex = /^.*\/(\d+,){2}\d+/;
    const matches = url.match(urlRegex);
    return matches != null;
}
