import React, { createContext, useContext, useState } from 'react';
import { TransformedTweet } from './types/tweet';

const TweetContext = createContext([] as TransformedTweet[]);

export const useWhatTheFuck = () => {
  const [state] = useState('fuck');
  return state;
};

export const useTweet = () => {
  const tweets = useContext(TweetContext);

  const getById = (id: string) => {
    // @ts-expect-error
    const tweet = tweets[id] as TransformedTweet;
    return tweet;
  };

  return { getById };
};

interface TweetProviderProps {
  tweets: TransformedTweet[];
  children: any;
}

export const TweetProvider = (props: TweetProviderProps) => {
  return <TweetContext.Provider value={props.tweets} {...props} />;
};

export const withTweets = (Component: any) => {
  return (hocProps: Pick<TweetProviderProps, 'tweets'>) => {
    return (
      <TweetProvider tweets={hocProps.tweets}>
        <Component {...hocProps} />
      </TweetProvider>
    );
  };
};
