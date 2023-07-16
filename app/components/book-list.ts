import Component from '@glimmer/component';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type Book from 'collection-demo/models/book';
import { tracked } from '@glimmer/tracking';
import type { Collection } from '@ember-data/types';

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
  constructor(owner: unknown, args: BookListSignature['Args']) {
    super(owner, args);
    this.getFirstPage();
  }

  _firstPage: Collection<Book> | null = null;
  async getFirstPage() {
    const { sort, filter, genre, author, page, limit } = this.args;

    const base = '/api/books';
    const params = [];

    if (author) {
      params.push(`author=${author}`);
    }
    if (filter) {
      params.push(`filter=${filter}`);
    }
    if (genre) {
      params.push(`genre=${genre}`);
    }
    if (page) {
      params.push(`page=${page}`);
    }
    if (limit) {
      params.push(`limit=${limit}`);
    }
    if (sort) {
      params.push(`sort=${sort}`);
    }

    const url = params.length ? `${base}?${params.join('&')}` : base;
    const books = await this.getPage(url);
    this._firstPage = books.content;
  }

  @service declare store: Store;

  @tracked books: Collection<Book> | null = null;

  getPage = async (url: string) => {
    const books = await this.store.request<Book>({ url });
    this.books = books.content;
    return books;
  };

  reset = () => {
    if (this.books) {
      this.getPage(this.books.links.first);
    }
  };
}
