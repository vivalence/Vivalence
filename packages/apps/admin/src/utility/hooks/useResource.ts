// @ts-nocheck

import React, { useEffect, useState } from "react";
import { BaseRecord, useList } from "@refinedev/core";

import { useCache } from "./useCache"; // Adjust the import path as necessary

import { useEffect, useState } from "react";
import { useCache } from "./useCache"; // Ensure you import useCache correctly

export function useResource<T extends BaseRecord>(
  resource: string,
  map: (items: T[]) => OptionType<T>[],
): [OptionType<T>[], boolean, Error | undefined] {
  const params = {
    resource,
    pagination: {
      pageSize: 9999999,
    },
  };
  // if (sortField && sortDirection) {
  //     params.sorters = [{ field: sortField, order: sortDirection }];
  // }
  const queryResult = useList<T>(params);

  const [options, setOptions] = useState<OptionType<T>[]>([]);

  useEffect(() => {
    if (queryResult.data?.data) {
      setOptions(map(queryResult.data.data));
    }
  }, [queryResult.data?.data]);

  return [options, queryResult.isLoading, queryResult.error];
}
