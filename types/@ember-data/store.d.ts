interface Collection<T> {
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

export default class Store {
  request<T>(options: { url: string }): Promise<{ content: Collection<T> }>;

  getSchemaDefinitionService(): {
    attributesDefinitionFor: (identifier: {
      type: string;
    }) => Record<string, unknown>;
  };
}
