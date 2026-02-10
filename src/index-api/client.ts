import { ApiClient } from "../http-client.js";

export interface ObjectFilterCondition {
  uiLanguage?: number;
  hasLocalValues?: boolean;
  hasDisplayName?: boolean;
  searchPhrase?: string;
  objectTypeIds?: number[];
  objectIds?: number[];
  modifiedBy?: string;
  filters?: ObjectValueFilter[];
  deleted?: boolean;
  modifiedSince?: string;
  quickSearchAttributes?: { attrId: number; langId: number; variantId: number }[];
}

export interface ObjectValueFilter {
  attrId: number;
  langId: number;
  variantId: number;
  value?: string;
  compareOperator: number; // 0=Equal,1=NotEqual,2=LT,3=LTE,4=GT,5=GTE,6=Wildcard,7=Ref
}

export interface ObjectSortBy {
  sortBy: number; // 0=Score,1=ObjId,2=TypeRef,3=DisplayName,4=Modified,5=ModifiedBy,6=Attribute
  attrId?: number;
  langId?: number;
  variantId?: number;
  reverse?: boolean;
}

export interface CommentFilterCondition {
  searchPhrase?: string;
  user?: string;
  mentioned?: string;
  objectTypes?: number[];
}

export interface CommentSortBy {
  field: number; // 0=Id,1=User,2=Created,3=Modified,4=ObjectId,5=ObjectType
  reverse?: boolean;
}

export interface SuggestAttribute {
  attrId: number;
  langId?: number;
  variantId?: number;
}

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}

export function createIndexClient(api: ApiClient) {
  return {
    searchObjects: (branch: string, params: {
      filter?: ObjectFilterCondition;
      sortBy?: ObjectSortBy[];
      skip?: number;
      take?: number;
    } = {}) => {
      const body = stripUndefined({
        filter: params.filter ?? {},
        sortBy: params.sortBy,
        page: { skip: params.skip ?? 0, take: params.take ?? 20 },
      });
      return api.post(`/branches/${branch}/objects`, body);
    },

    countObjects: (branch: string, params: {
      filter?: ObjectFilterCondition;
    } = {}) => {
      const body = stripUndefined({ filter: params.filter ?? {} });
      return api.post(`/branches/${branch}/objectCount`, body);
    },

    objectOccurrences: (branch: string, params: {
      filter?: ObjectFilterCondition;
      getModifiedByOccurrences?: boolean;
      getTypeOccurrences?: boolean;
      getDeletedOccurrences?: boolean;
      skip?: number;
      take?: number;
    } = {}) => {
      const body = stripUndefined({
        filter: params.filter ?? {},
        getModifiedByOccurrences: params.getModifiedByOccurrences ?? false,
        getTypeOccurrences: params.getTypeOccurrences ?? false,
        getDeletedOccurrences: params.getDeletedOccurrences ?? false,
        page: { skip: params.skip ?? 0, take: params.take ?? 20 },
      });
      return api.post(`/branches/${branch}/objectOccurrences`, body);
    },

    suggestions: (branch: string, params: {
      pattern?: string;
      suggestDisplayName?: boolean;
      suggestAttributes?: SuggestAttribute[];
      filter?: ObjectFilterCondition;
      take?: number;
      sortByValue?: boolean;
      analyze?: boolean;
      fuzzy?: boolean;
      fuzzyMinSimilarity?: number;
      fuzzyPrefixLength?: number;
    } = {}) => {
      const body = stripUndefined({
        pattern: params.pattern,
        suggestDisplayName: params.suggestDisplayName ?? true,
        suggestAttributes: params.suggestAttributes,
        filter: params.filter ?? {},
        take: params.take ?? 10,
        sortByValue: params.sortByValue ?? false,
        analyze: params.analyze ?? true,
        fuzzy: params.fuzzy ?? false,
        fuzzyMinSimilarity: params.fuzzyMinSimilarity ?? 0.5,
        fuzzyPrefixLength: params.fuzzyPrefixLength ?? 0,
      });
      return api.post(`/branches/${branch}/suggestions`, body);
    },

    searchComments: (branch: string, params: {
      filter?: CommentFilterCondition;
      sort?: CommentSortBy;
      skip?: number;
      take?: number;
    } = {}) => {
      const body = stripUndefined({
        filter: params.filter ?? {},
        sort: params.sort,
        page: { skip: params.skip ?? 0, take: params.take ?? 20 },
      });
      return api.post(`/branches/${branch}/comments`, body);
    },

    countComments: (branch: string, params: {
      filter?: CommentFilterCondition;
    } = {}) => {
      const body = stripUndefined({ filter: params.filter ?? {} });
      return api.post(`/branches/${branch}/commentCount`, body);
    },

    workItemOccurrences: (params: {
      skip?: number;
      take?: number;
    } = {}) => {
      const body = stripUndefined({
        page: { skip: params.skip ?? 0, take: params.take ?? 20 },
      });
      return api.post("/workItemOccurrences", body);
    },

    commentOccurrences: (branch: string, params: {
      filter?: CommentFilterCondition;
      getUserOccurrences?: boolean;
      getMentionedUsersOccurrences?: boolean;
      getObjectTypeOccurrences?: boolean;
      skip?: number;
      take?: number;
    } = {}) => {
      const body = stripUndefined({
        filter: params.filter ?? {},
        getUserOccurrences: params.getUserOccurrences ?? false,
        getMentionedUsersOccurrences: params.getMentionedUsersOccurrences ?? false,
        getObjectTypeOccurrences: params.getObjectTypeOccurrences ?? false,
        page: { skip: params.skip ?? 0, take: params.take ?? 20 },
      });
      return api.post(`/branches/${branch}/commentOccurrences`, body);
    },

    objectXmlLinkCount: (branch: string, params: {
      objectIds: number[];
    }) => {
      const body = { objectIds: params.objectIds };
      return api.post(`/branches/${branch}/objectXmlLinkCount`, body);
    },

    matchStrings: (params: {
      query: string;
      useOrOperator?: boolean;
      strings: string[];
    }) => {
      const body = stripUndefined({
        query: params.query,
        useOrOperator: params.useOrOperator ?? false,
        strings: params.strings,
      });
      return api.post("/utilities/matchStrings", body);
    },
  };
}

export type IndexClient = ReturnType<typeof createIndexClient>;
