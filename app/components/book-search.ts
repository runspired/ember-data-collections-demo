import Component from '@glimmer/component';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import { cached, tracked } from '@glimmer/tracking';

export interface BookSearchSignature {
  Element: HTMLDivElement;
  Args: null;
}

type SearchKeys = 'sort' | 'title' | 'genre' | 'author' | 'sortDirection';

export default class BookListComponent extends Component<BookSearchSignature> {
  @service declare store: Store;

  @tracked sort: string | null = 'title';
  @tracked title: string | null = null;
  @tracked genre: string | null = null;
  @tracked author: string | null = null;
  @tracked sortDirection = 'asc';
  _lastSortDirection = 'asc';

  @cached
  get sortOptions() {
    return Object.keys(
      this.store
        .getSchemaDefinitionService()
        .attributesDefinitionFor({ type: 'book' })
    );
  }

  @cached
  get sortQuery() {
    return this.sort ? `${this.sort}:${this.sortDirection}` : '';
  }

  update = (event: InputEvent & { target: HTMLInputElement }) => {
    event.preventDefault();
    const name = event.target.name as SearchKeys;
    this[name] = event.target.value;

    if (name === 'sort') {
      this.sortDirection =
        event.target.value === ''
          ? ''
          : this._lastSortDirection === ''
          ? 'asc'
          : this._lastSortDirection;
      this._lastSortDirection = this.sortDirection;
    }
  };
}
