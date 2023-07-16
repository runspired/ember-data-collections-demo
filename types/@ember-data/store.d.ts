import { Collection } from './types';

export default class Store {
  request<T>(options: { url: string }): Promise<{ content: Collection<T> }>;

  getSchemaDefinitionService(): {
    attributesDefinitionFor: (identifier: {
      type: string;
    }) => Record<string, unknown>;
  };
}
