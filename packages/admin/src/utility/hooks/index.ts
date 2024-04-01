// @ts-nocheck

import React, { useState, useEffect } from "react";
import { useList, BaseRecord } from "@refinedev/core";

export function useResource<T extends BaseRecord>(
    resource: string,
    map: (items: T[]) => OptionType<T>[],
): [OptionType<T>[], boolean, Error | undefined] {
    const queryResult = useList<T>({
        resource,
        pagination: {
            pageSize: 9999999,
        },
    });

    const [options, setOptions] = useState<OptionType<T>[]>([]);

    useEffect(() => {
        if (queryResult.data?.data) {
            setOptions(map(queryResult.data.data));
        }
    }, [queryResult.data?.data]);

    return [options, queryResult.isLoading, queryResult.error];
}
