export interface Collection<T> {
  links: {
    self: string;
    first: string;
    last: string;
    next: string | null;
    prev: string | null;
  };
  meta: {
    total: number;
    pages: number;
  };
  data: T[];
}
