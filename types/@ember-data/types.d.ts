export interface Collection<T> {
  next(): Promise<Collection<T> | null>;
  links: {
    self: string;
    first: string;
    last: string;
    next: string | null;
    prev: string | null;
  };
  meta: {
    currentPage: number;
    booksTotal: number;
    pagesTotal: number;
  };
  data: T[];
}
