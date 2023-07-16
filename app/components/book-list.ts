import Component from '@glimmer/component';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type Book from 'collection-demo/models/book';
import { cached, tracked } from '@glimmer/tracking';
import type { Collection } from '@ember-data/types';
import { query } from '@ember-data/json-api/request';
import { assert } from '@ember/debug';
export interface BookListSignature {
  Element: HTMLDivElement;
  Args: {
    sort: string | null;
    filter: string | null;
    genre: string | null;
    author: string | null;
    page: number | null;
    limit: number | null;
  };
}

class PaginationLinks {
  declare _pages: string[];
  @tracked declare pages: string[];

  addPage(page: Collection<unknown>) {
    let { _pages } = this;
    const { pagesTotal, currentPage } = page.meta;

    if (currentPage === 1 && (!_pages || _pages[0] !== page.links.self)) {
      _pages = this._pages = new Array(pagesTotal).fill('.');
    } else if (pagesTotal !== _pages.length) {
      const cached = _pages;
      _pages = this._pages = new Array(pagesTotal).fill('.');
      for (let i = 0; i < pagesTotal; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        _pages[i] = cached[i]!;
      }
    }
    const pages = _pages;

    pages[currentPage - 1] = page.links.self;

    pages[0] = page.links.first;
    pages[pagesTotal - 1] = page.links.last;
    if (pagesTotal > 1 && currentPage > 1) {
      assert('previous page should exist', page.links.prev);
      pages[currentPage - 2] = page.links.prev;
    }
    if (pagesTotal > 1 && currentPage < pagesTotal - 1) {
      assert('next page should exist', page.links.next);
      pages[currentPage] = page.links.next;
    }

    this.pages = pages;
  }
}

class AsyncContent<T> {
  @tracked content: T | undefined;
}

function filterEmpty(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (obj[key]) {
      result[key] = obj[key];
    }
  }
  return result;
}

export default class BookListComponent extends Component<BookListSignature> {
  @service declare store: Store;
  @tracked currentUrl: string | null = null;
  links = new PaginationLinks();
  dataWrapper = new AsyncContent<Collection<Book>>();

  // we use this to detect inbound data changes
  _firstPageOptions: { url: string } | null = null;

  @cached
  get firstPageOptions(): { url: string } {
    const { sort, filter, genre, author, page, limit } = this.args;

    const options = query(
      'book',
      filterEmpty({ sort, filter, genre, author, page, limit })
    );
    // eslint-disable-next-line ember/no-side-effects
    this._firstPageOptions = options;
    return options;
  }

  @cached
  get currentPage() {
    const _firstPageOptions = this._firstPageOptions;
    const firstPageOptions = this.firstPageOptions;
    const currentUrl = this.currentUrl;

    // if the first page options changed, we need to fetch a new first page
    if (_firstPageOptions?.url !== firstPageOptions.url) {
      return this.fetchPage(firstPageOptions);
    }

    return this.fetchPage(currentUrl ? { url: currentUrl } : firstPageOptions);
  }

  get books(): Collection<Book> | null {
    return this.currentPage.content || null;
  }

  fetchPage(options: { url: string }) {
    const dataWrapper = this.dataWrapper;
    const future = this.store.request<Book>(options);

    future.then((books) => {
      dataWrapper.content = books.content;
      this.links.addPage(books.content);
    });

    return dataWrapper;
  }

  updatePage = (url: string) => {
    this.currentUrl = url;
  };
}
