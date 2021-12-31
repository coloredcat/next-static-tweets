import qs from 'qs';
import { RawTweetType, TransformedTweet, TweetData } from './types/tweet';

interface GetTweetArgs {
  markdown: string;
  regex?: string;
}

/**
 * Based on @leerob's original code
 * https://github.com/leerob/leerob.io/blob/main/lib/twitter.ts
 * Improved by Maxime Heckel
 * https://github.com/MaximeHeckel/blog.maximeheckel.com/blob/main/lib/tweets.ts
 *
 * Parses markdown to find embedded tweets and returns their data.
 * A custom regex expression can be pased if your component isn't named <Tweet>
 */
export const getTweets = async (args: GetTweetArgs) => {
  const { markdown, regex = /<Tweet\sid="[0-9]+"\s\/>/g } = args;

  const { TWITTER_API_KEY } = process.env;

  if (TWITTER_API_KEY) {
    /**
     * Find all occurrence of <Tweet id="NUMERIC_TWEET_ID"/>
     * in the content of the MDX blog post
     */
    const tweetMatch = markdown.match(regex);

    /**
     * For all occurrences / matches, extract the id portion of the
     * string, i.e. anything matching the regex /[0-9]+/g
     *
     * tweetIDs then becomes an array of string where each string is
     * the id of a tweet.
     * These IDs are then passed to the getTweets function to be fetched from
     * the Twitter API.
     */
    const tweetIDs = tweetMatch?.map(mdxTweet => {
      const id = mdxTweet.match(/[0-9]+/g)![0];
      return id;
    });

    if (tweetIDs) {
      return await fetchTweets(tweetIDs);
    }
  } else {
    console.warn('A valid Twitter API key was not provided.');
  }

  return [];
};

export const fetchTweets = async (tweetIDs: string[]) => {
  const queryParams = qs.stringify({
    ids: tweetIDs.join(','),
    expansions:
      'author_id,attachments.media_keys,referenced_tweets.id,referenced_tweets.id.author_id',
    'tweet.fields':
      'attachments,author_id,public_metrics,created_at,id,in_reply_to_user_id,referenced_tweets,text',
    'user.fields': 'id,name,profile_image_url,protected,url,username,verified',
    'media.fields':
      'duration_ms,height,media_key,preview_image_url,type,url,width,public_metrics',
  });

  const response = await fetch(
    `https://api.twitter.com/2/tweets?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_API_KEY}`,
      },
    }
  );
  const tweets = (await response.json()) as RawTweetType;

  const getAuthorInfo = (author_id: string) => {
    return tweets.includes.users.find(user => user.id === author_id)!;
  };

  const getReferencedTweets = (mainTweet: TweetData) => {
    return (
      mainTweet?.referenced_tweets?.map(referencedTweet => {
        const fullReferencedTweet = tweets.includes.tweets.find(
          tweet => tweet.id === referencedTweet.id
        )!;

        return {
          ...fullReferencedTweet,
          type: referencedTweet.type,
          author: getAuthorInfo(fullReferencedTweet.author_id),
        };
      }) || []
    );
  };

  return tweets.data.reduce(
    (allTweets: Record<string, TransformedTweet>, tweet: TweetData) => {
      const tweetWithAuthor = {
        ...tweet,
        media:
          tweet?.attachments?.media_keys.map(key =>
            tweets.includes.media.find(media => media.media_key === key)
          ) || [],
        referenced_tweets: getReferencedTweets(tweet),
        author: getAuthorInfo(tweet.author_id),
      };

      // @ts-ignore @MaximeHeckel: somehow media types are conflicting
      allTweets[tweet.id] = tweetWithAuthor;

      return allTweets;
    },
    {} as Record<string, TransformedTweet>
  );
};
