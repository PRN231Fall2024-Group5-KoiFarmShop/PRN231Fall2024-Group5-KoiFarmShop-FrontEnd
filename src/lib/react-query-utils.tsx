import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface QueryFnProps<T> {
    data: T[],
    isSuccess: boolean,
    message: string,
}

export const useEntities = <T extends { id: string }>(
    key: string,
    url: string
) => {
    const entities = useQuery<QueryFnProps<T>, Error>({
        queryKey: [key],
        queryFn: async ({ signal }): Promise<QueryFnProps<T>> => {
            const { data } = await axios.get<QueryFnProps<T>>(url, { signal });
            console.log("DATA", data);
            return data; // Return the full QueryFnProps<T> object
        }
    });

    return {
        entities,
    };
};

export const useEntity = <T extends { id: string }>(
    key: string,
    url: string,
    id: string | undefined | null
  ) => {
    const queryClient = useQueryClient();
    const invalidateActive = () =>
        queryClient.invalidateQueries({
          queryKey: [key, "query"],
          type: "active",
        });

    const entity = useQuery<T | null, Error>({
      queryKey: [key, id],
      queryFn: async ({ signal }) => {
        if (id) {
          const { data } = await axios.get<T>(url + "/" + id, { signal });
          return data;
        }
        return null;
      },
      enabled: !!id,
    });

    const add = useMutation<T, Error, T, any>({
        mutationFn: async (entity: T): Promise<T> => {
            const { data } = await axios.post<T>(url, entity);
            return data;
          },
        onSuccess:  (addedEntity) => {
            queryClient.setQueryData([key, addedEntity.id], addedEntity);
            queryClient.setQueryData([key], (cachedEntities: T[] | undefined) =>
            cachedEntities ? [...cachedEntities, addedEntity] : undefined
            );
            invalidateActive();
        },
    });

    const update = useMutation<T, Error, T, any>({
        mutationFn: async (entity: T): Promise<T> => {
            const { data } = await axios.put<T>(url + "/" + entity.id, entity);
            return data;
        },
        onSuccess: (updatedEntity, variable) => {
            queryClient.setQueryData([key, id], updatedEntity);
            queryClient.setQueryData([key], (cachedEntities: T[] | undefined) =>
            cachedEntities
                ? cachedEntities.map((cachedEntity) =>
                    cachedEntity.id === variable.id ? updatedEntity : cachedEntity
                )
                : undefined
            );
            invalidateActive();
        },
    });

    const remove = useMutation<string, Error, string, any>({
        mutationFn: async (id: string): Promise<string> => {
            const { data } = await axios.delete(url + "/" + id);
            return data;
        },
        onSuccess: (deletedId) => {
            queryClient.setQueryData([key, id], null);
            queryClient.setQueryData(
            [key],
            (cachedEntities: T[] | undefined) =>
                cachedEntities?.filter(
                (cachedEntity) => cachedEntity.id !== deletedId
                )
            );
            invalidateActive();
        },
    });
  
    return { 
        entity,
        add,
        update,
        remove,
     };
  };
 