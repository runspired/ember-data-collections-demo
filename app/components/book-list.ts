import Component from '@glimmer/component';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type Book from 'collection-demo/models/book';
import { cached, tracked } from '@glimmer/tracking';
import type { Collection } from '@ember-data/types';
import { query } from '@ember-data/json-api/request';
import { filterEmpty } from '@ember-data/request-utils';
import { PaginationLinks } from 'collection-demo/utils/pagination-links';
import { use, type Reactive } from 'ember-resources';
import { keepLatest } from 'ember-resources/util/keep-latest';
import { AsyncContent, CurrentPage } from './current-page';

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

export default class BookListComponent extends Component<BookListSignature> {
  @service declare store: Store;
  @tracked currentUrl: string | null = null;

  // want owner and destruction?, use @link from ember-resources
  //   https://ember-resources.pages.dev/funcs/link.link
  //   (unrelated to resources)
  //   I need to RFC this in to the framework tho
  links = new PaginationLinks();

  // we use this to detect inbound data changes
  _firstPageOptions: { url: string } | null = null;

  // exposes a .current property
  //
  // I don't know why TS feels the inference here isn't safe
  currentPage: Reactive<AsyncContent<Collection<Book>>> = use(
    this,
    CurrentPage({
      currentUrl: () => this.currentUrl,
      firstPageOptions: () => this.firstPageOptions,
      addPage: this.links.addPage,
    })
  );

  // optional decorator @use
  // (won't run unless accessed (which is why the current property is needed on the above)
  @use currentPage2 = CurrentPage({
    currentUrl: () => this.currentUrl,
    firstPageOptions: () => this.firstPageOptions,
    addPage: this.links.addPage,
  });

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

  get currentBooks(): Collection<Book> | null {
    return this.currentPage.current.content || null;
  }

  // absorbs null-flashes as underlying data changes
  @use books = keepLatest({
    value: () => this.currentBooks,
    when: () => !this.currentBooks,
  });

  updatePage = (url: string) => {
    this.currentUrl = url;
  };
}
