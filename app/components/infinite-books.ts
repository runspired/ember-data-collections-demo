import Component from '@glimmer/component';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type Book from 'collection-demo/models/book';
import { tracked } from '@glimmer/tracking';
import type { Collection } from '@ember-data/types';

export interface InfiniteBookSignature {
  Element: HTMLUListElement;
  Args: {
    allBooks: Collection<Book>;
  };
}

class Pages<T> {
  @tracked pages: Collection<T>[] = [];
  @tracked data: T[] = [];

  constructor(page: Collection<T>) {
    this.pages = [page];
    this.data = page.data.slice();
  }

  addPage(page: Collection<T>) {
    this.pages.push(page);
    this.data = this.data.concat(page.data);
  }
}

export default class InfiniteBookComponent extends Component<InfiniteBookSignature> {
  @service declare store: Store;
  pageCollection = new Pages(this.args.allBooks);

  get books(): Book[] {
    return this.pageCollection.data;
  }

  next = async () => {
    const page = this.pageCollection.pages.at(-1);
    const result = await page?.next();
    if (result) {
      this.pageCollection.addPage(result);
    }
  };
}
