import React, { useState, useEffect } from "react";
import { useList, BaseRecord } from "@refinedev/core";

export function useResource<T extends BaseRecord>(
  resource: string,
  map: (data: T[]) => OptionType<T>[],
): [OptionType<T>[], boolean, Error | undefined] {
  const queryResult = useList<T>({ resource });
  const [options, setOptions] = useState<OptionType<T>[]>([]);

  useEffect(() => {
    if (queryResult.data?.data) {
      setOptions(map(queryResult.data.data));
    }
  }, [queryResult.data?.data]);

  return [options, queryResult.isLoading, queryResult.error];
}
