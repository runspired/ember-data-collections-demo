import Component from '@glimmer/component';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type Book from 'collection-demo/models/book';
import { cached, tracked } from '@glimmer/tracking';
import type { Collection } from '@ember-data/types';

export interface InfiniteBookSignature {
  Element: HTMLUListElement;
  Args: {
    allBooks: Collection<Book>;
  };
}

class Pages<T> {
  @tracked pages: Collection<T>[] = [];

  constructor(pages: Collection<T>[]) {
    this.pages = pages;
  }

  @cached
  get data(): T[] {
    let data: T[] = [];
    this.pages.forEach((page) => {
      data = data.concat(page.data);
    });
    return data;
  }
}

export default class InfiniteBookComponent extends Component<InfiniteBookSignature> {
  @service declare store: Store;
  pageCollection = new Pages([this.args.allBooks]);

  @cached
  get books(): Book[] {
    return this.pageCollection.data;
  }

  next = async () => {
    const page = this.pageCollection.pages?.at(-1);
    const result = await page?.next();
    if (result) {
      this.pageCollection.pages.push(result);
      // eslint-disable-next-line no-self-assign
      this.pageCollection.pages = this.pageCollection.pages;
    }
  };
}
