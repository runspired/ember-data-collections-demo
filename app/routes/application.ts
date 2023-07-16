import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { setBuildURLConfig } from '@ember-data/request-utils';

setBuildURLConfig({
  host: '/',
  namespace: 'api',
});

export default class ApplicationRoute extends Route {
  @service declare store: Store;

  async model() {
    const genres = this.store.request({ url: '/api/books/genres' });
    const authors = this.store.request({ url: '/api/books/authors' });
    const data = await Promise.all([genres, authors]);
    return {
      genres: data[0].content.data,
      authors: data[1].content.data,
    };
  }
}
