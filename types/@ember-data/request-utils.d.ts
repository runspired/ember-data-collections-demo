export function setBuildURLConfig(config: {
  host?: string;
  namespace?: string;
}): void;

export function filterEmpty(
  query: Record<string, unknown>
): Record<string, unknown>;
