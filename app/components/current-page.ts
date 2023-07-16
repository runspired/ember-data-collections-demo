import type Store from '@ember-data/store';
import type Book from 'collection-demo/models/book';
import { tracked } from '@glimmer/tracking';
import type { Collection } from '@ember-data/types';
import { resource, resourceFactory } from 'ember-resources';

export class AsyncContent<T> {
  @tracked content: T | undefined;
  @tracked isLoading = true;
  @tracked error: string | Error | unknown | null = null;

  get isInitiallyLoading() {
    return this.isLoading && this.content === undefined;
  }

  get hasError() {
    return this.error !== null;
  }
}

interface FirstPageOptions {
  url: string;
  sort?: string | null;
  filter?: string | null;
  genre?: string | null;
  author?: string | null;
  page?: number | null;
  limit?: number | null;
}

// TODO: inline to ember-resources?
//  https://github.com/NullVoxPopuli/ember-resources/issues/945
const unwrap = <T>(x: T | (() => T)): T =>
  typeof x === 'function' ? (x as any)() : x;

export const CurrentPage = resourceFactory(
  /**
   * This way of passing args has nothing to do with resources,
   * but is just how you pass args for lazy evaluation without creating
   * an options class with its own tracked properties
   */
  (optionsFns: {
    currentUrl: () => string | null;
    firstPageOptions: () => FirstPageOptions;
    addPage: (content: Collection<unknown>) => void;
  }) => {
    let previousFirstPageOptions: FirstPageOptions | undefined;

    /**
     * TODO: add request cancellation
     *     See example: https://ember-resources.pages.dev/funcs/util_remote_data.RemoteData
     */
    return resource(({ on, owner, use }) => {
      const dataWrapper = new AsyncContent<Collection<Book>>();
      const currentUrl = unwrap(optionsFns.currentUrl);
      const firstPageOptions = unwrap(optionsFns.firstPageOptions);
      const addPage = optionsFns.addPage;

      const store = owner.lookup('service:store') as unknown as Store;

      async function fetchPage() {
        // Don't accidentally auto-track anything on data-wrapper
        // when invoking fetchPage
        await Promise.resolve();

        try {
          dataWrapper.error = null;
          dataWrapper.isLoading = true;

          let options = firstPageOptions;

          if (previousFirstPageOptions?.url === firstPageOptions.url) {
            options = currentUrl ? { url: currentUrl } : firstPageOptions;
          }

          /**
           * TODO: make this its own resource so it can be used directly
           *
           * const books = use(Request(() => options));
           *
           * or something like that,
           * that pushes the async/await handling out of this code, and in to the request code.
           */
          const books = await store.request<Book>(options);
          dataWrapper.content = books.content;
          addPage(books.content);
        } catch (e) {
          dataWrapper.error = e;
        } finally {
          dataWrapper.isLoading = false;
        }
      }

      fetchPage();

      return dataWrapper;
    });
  }
);
