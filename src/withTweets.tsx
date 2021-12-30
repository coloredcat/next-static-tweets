import React, { createContext, useContext } from 'react';
import { TransformedTweet } from './types/tweet';

const TweetContext = createContext([] as TransformedTweet[]);

/**
 * React hook to access Tweet data.
 *
 * @returns {getById, getAll} - Get a specific tweet by Id, or return all tweets.
 */
export const useTweet = () => {
  const tweets = useContext(TweetContext);

  const getById = (id: string) => {
    // @ts-expect-error
    const tweet = tweets[id] as TransformedTweet;
    return tweet;
  };

  const getAll = () => {
    return tweets;
  };

  return { getById, getAll };
};

interface TweetProviderProps {
  tweets: TransformedTweet[];
  children: any;
}

export const TweetProvider = (props: TweetProviderProps) => {
  return <TweetContext.Provider value={props.tweets} {...props} />;
};

/**
 * Wraps your page and adds a Context Provider with tweet info
 */
export const withTweets = (Component: any) => {
  return (hocProps: Pick<TweetProviderProps, 'tweets'>) => {
    return (
      <TweetProvider tweets={hocProps.tweets}>
        <Component {...hocProps} />
      </TweetProvider>
    );
  };
};
