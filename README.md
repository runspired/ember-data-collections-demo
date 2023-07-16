# EmberData Collections Demo

This application demos a few ways you can utilize the pagination features of the `Collection` returned
when using `store.request(fetchOptions)`.

In this example, by aligning the API tightly to the cache format (JSON:API) we gain immediate access to paginated collections
from any initial request with no additional overhead on the client to build the URLs.

Collectively they demonstrate how the url based approach to caching documents allows efficient de-duping of network requests
and multiple server-driven perspectives into the same underlying list to easily co-exist on a page. 

- `<InfiniteBooks />` utilizes the collection's built-in `next()` method to advance as you scroll, while
- `<BooksList />` keeps track of what links you've seen so far in a paginated collection letting you quickly
output button based pagination for every link you've seen so far.
- `<BooksSearch />` provides user inputs to a `<BooksList />` to show query building

## Cloning and Running This Example

* `git clone git@github.com:runspired/ember-data-collections-demo.git data-collections-demo`
* `cd data-collections-demo`
* `npm install`
* `ember s -e production`
* Visit your app at [http://localhost:4200](http://localhost:4200).
