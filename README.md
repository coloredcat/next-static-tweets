# Next Static Tweets

Next Static Tweets builds upon the work done by Lee Robinson and Maxime Heckel to abstract boilerplate code and introduces some helpful hooks to help render Tweets statically in Next.js MDX sites.

## Installation

```
  npm i @ironeko/next-static-tweets
```

## Usage

In your `getStaticProps`:

```js
// pages/post.js

import { getTweets } from '@ironeko/next-static-tweets';

export const getStaticProps = async () => {

  // getTweets will automatically find any components named <Tweet>, but it also takes a `regex` config to
  // in case you want to customise it
  const tweets = await getTweets({ markdown: "<Tweet id="1475482722877546510" />" });

  return {
    props: {
      tweets,
    },
  };
};
```

Then wrap your Page export in `withTweets`:

```js
// pages/post.js

import { withTweets } from '@ironeko/next-static-tweets';

function Post() {
  // ...
}

export default withTweets(Post);
```

Then wherever your MDX gets converted into components, for example:

```js
import { MDXProvider } from '@mdx-js/react';
import { useTweet, Tweet as TweetPrimitive } from '@ironeko/next-static-tweets';

function Tweet(id) {
  const { getById } = useTweet();
  return <TweetPrimitive {...getById(props.id)} />;
}

function RenderMyMDXArticle() {
  return <MDXProvider components={{ Tweet }}>{children}</MDXProvider>;
}
```

⚠️ You shouldn't use the `Tweet` component in production, it's just for quick testing. Internally it doesn't use `next/image` so you should most likely re-implement it.

🚨 Internally we use the Twitter V2 API, which unfortunately does not have any endpoints to fetch videos or GIFs. The `Tweet` component deals with this by displaying a warning on hover.
