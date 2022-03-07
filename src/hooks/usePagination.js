import React from 'react';
import { client } from 'client';
import appConfig from 'app.config';

const uniqBy = (arr, pred) => {
  const cb = typeof pred === 'function' ? pred : (o) => o[pred];

  return [...arr.reduce((map, item) => {
    const key = (item === null || item === undefined) ?
      item : cb(item);

    map.has(key) || map.set(key, item);

    return map;
  }, new Map()).values()];
};

export default function usePagination(fn, {
  nodes = [],
  pageInfo = {},
  initialArgs = {
    first: appConfig.postsPerPage,
    after: undefined
  }
} = {}) {
  const fnRef = React.useRef(fn);
  fnRef.current = fn;
  const [data, setData] = React.useState({
    nodes,
    pageInfo: pageInfo
  });
  const [paginationArgs, setPaginationArgs] = React.useState(initialArgs);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (paginationArgs?.after) {
      setIsLoading(true);
      client.client.resolved(() => {
        return fnRef.current(client.client.query, paginationArgs)
      })
        .then((data) => {
          setData(function (prev) {
            return {
              nodes: uniqBy([...prev.nodes, ...data?.nodes], (v) => v.id),
              pageInfo: data?.pageInfo
            }
          })
        })
        .finally(() => {
          setIsLoading(false);
      })
    }
  }, [paginationArgs?.after])

  const fetchMore = (args) => {
    setPaginationArgs(args);
  };

  return {data, fetchMore, isLoading}
}