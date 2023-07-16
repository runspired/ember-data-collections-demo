import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { setBuildURLConfig } from '@ember-data/request-utils';
import { query } from '@ember-data/json-api/request';

setBuildURLConfig({
  host: '/',
  namespace: 'api',
});

export default class ApplicationRoute extends Route {
  @service declare store: Store;

  async model() {
    const genres = this.store.request({ url: '/api/books/genres' });
    const authors = this.store.request({ url: '/api/books/authors' });
    const books = this.store.request(query('book'));

    const data = await Promise.all([genres, authors, books]);
    return {
      genres: data[0].content.data,
      authors: data[1].content.data,
      allBooks: data[2].content,
    };
  }
}
