import { Signal, Pattern } from "../types/index.ts";

export function splitPath(path: string): string[] {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized.split("/").filter((segment) => segment.length > 0);
}

export function isParameter(segment: string): boolean {
  return segment.startsWith(":");
}

export function isWildcard(segment: string): boolean {
  return segment === "*";
}

export function getParameterName(segment: string): string {
  return segment.substring(1);
}

export function matchPathSegment(
  patternSegment: string,
  signalSegment: string,
): Record<string, string> | null {
  if (isWildcard(patternSegment)) {
    return {};
  } else if (isParameter(patternSegment)) {
    const paramName = getParameterName(patternSegment);
    return { [paramName]: signalSegment };
  } else if (patternSegment === signalSegment) {
    return {};
  }

  return null;
}

export function matchKeyWithModifiers(
  patternKey: string,
  signalKey: string,
  patternModifiers: string[] | undefined,
  signalModifiers: string[] | undefined,
): boolean {
  if (patternKey && patternKey !== signalKey) {
    return false;
  }

  if (patternModifiers && patternModifiers.length > 0) {
    if (!signalModifiers) return false;

    const modifiersMatch =
      patternModifiers.every((m) => signalModifiers.includes(m)) &&
      patternModifiers.length === signalModifiers.length;

    if (!modifiersMatch) return false;
  }

  return true;
}
