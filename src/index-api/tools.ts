import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { IndexClient } from "./client.js";

const objectValueFilterSchema = z.object({
  attrId: z.number().describe("Attribute definition ID"),
  langId: z.number().default(0).describe("Language ID (0 for language-independent)"),
  variantId: z.number().default(0).describe("Variant ID (0 for no variant)"),
  value: z.string().optional().describe("Filter value"),
  compareOperator: z.number().default(0).describe("0=Equal, 1=NotEqual, 2=LT, 3=LTE, 4=GT, 5=GTE, 6=Wildcard, 7=Ref"),
});

const objectFilterSchema = z.object({
  uiLanguage: z.number().optional().describe("UI language ID for display names"),
  hasLocalValues: z.boolean().optional().describe("Filter objects with local (non-inherited) values"),
  hasDisplayName: z.boolean().optional().describe("Filter objects that have a display name"),
  searchPhrase: z.string().optional().describe("Full-text search phrase"),
  objectTypeIds: z.array(z.number()).optional().describe("Filter by object type IDs"),
  objectIds: z.array(z.number()).optional().describe("Filter by specific object IDs"),
  modifiedBy: z.string().optional().describe("Filter by user who last modified"),
  filters: z.array(objectValueFilterSchema).optional().describe("Attribute value filters"),
  deleted: z.boolean().optional().describe("Filter deleted objects"),
  modifiedSince: z.string().optional().describe("ISO date-time, e.g. '2026-01-01T00:00:00Z'"),
  quickSearchAttributes: z.array(z.object({
    attrId: z.number().describe("Attribute definition ID"),
    langId: z.number().default(0).describe("Language ID (0 for language-independent)"),
    variantId: z.number().default(0).describe("Variant ID (0 for no variant)"),
  })).optional().describe("Scope quick search to specific attributes"),
}).optional().describe("Structured filter condition");

const objectSortBySchema = z.object({
  sortBy: z.number().describe("0=Score, 1=ObjId, 2=TypeRef, 3=DisplayName, 4=Modified, 5=ModifiedBy, 6=Attribute"),
  attrId: z.number().optional().describe("Attribute ID (required when sortBy=6)"),
  langId: z.number().optional().describe("Language ID for attribute sort"),
  variantId: z.number().optional().describe("Variant ID for attribute sort"),
  reverse: z.boolean().optional().describe("Reverse sort order"),
});

const commentFilterSchema = z.object({
  searchPhrase: z.string().optional().describe("Full-text search in comment body"),
  user: z.string().optional().describe("Filter by comment author"),
  mentioned: z.string().optional().describe("Filter by mentioned user"),
  objectTypes: z.array(z.number()).optional().describe("Filter by object type IDs of commented objects"),
}).optional().describe("Comment filter condition");

export function registerIndexTools(server: McpServer, client: IndexClient) {
  server.tool(
    "novadb_index_search_objects",
    "Full-text and filtered object search via the Index API. Supports structured filters, multi-field sorting, and pagination. Returns max 20 results by default; set 'take' for more.",
    {
      branch: z.string().describe("Branch ID"),
      filter: objectFilterSchema,
      sortBy: z.array(objectSortBySchema).optional().describe("Sort criteria (multiple fields supported)"),
      skip: z.number().optional().describe("Number of results to skip"),
      take: z.number().optional().describe("Number of results to return (default: 20)"),
    },
    async ({ branch, filter, sortBy, skip, take }) => {
      const result = await client.searchObjects(branch, { filter, sortBy, skip, take });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_index_count_objects",
    "Count objects matching structured filters via the Index API.",
    {
      branch: z.string().describe("Branch ID"),
      filter: objectFilterSchema,
    },
    async ({ branch, filter }) => {
      const result = await client.countObjects(branch, { filter });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_index_object_occurrences",
    "Get facet counts for objects (by type, modifiedBy, deleted status) matching a filter.",
    {
      branch: z.string().describe("Branch ID"),
      filter: objectFilterSchema,
      getModifiedByOccurrences: z.boolean().optional().describe("Include modifiedBy facet counts"),
      getTypeOccurrences: z.boolean().optional().describe("Include object type facet counts"),
      getDeletedOccurrences: z.boolean().optional().describe("Include deleted/not-deleted facet counts"),
      skip: z.number().optional().describe("Number of facet entries to skip"),
      take: z.number().optional().describe("Number of facet entries to return (default: 20)"),
    },
    async ({ branch, filter, getModifiedByOccurrences, getTypeOccurrences, getDeletedOccurrences, skip, take }) => {
      const result = await client.objectOccurrences(branch, {
        filter, getModifiedByOccurrences, getTypeOccurrences, getDeletedOccurrences, skip, take,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_index_suggestions",
    "Get type-ahead suggestions from the search index. Supports fuzzy matching and attribute-specific suggestions.",
    {
      branch: z.string().describe("Branch ID"),
      pattern: z.string().optional().describe("Search pattern for suggestions"),
      suggestDisplayName: z.boolean().optional().describe("Include display name suggestions (default: true)"),
      suggestAttributes: z.array(z.object({
        attrId: z.number().describe("Attribute ID to suggest from"),
        langId: z.number().optional().describe("Language ID"),
        variantId: z.number().optional().describe("Variant ID"),
      })).optional().describe("Specific attributes to suggest from"),
      filter: objectFilterSchema,
      take: z.number().optional().describe("Number of suggestions (default: 10)"),
      sortByValue: z.boolean().optional().describe("Sort by value instead of relevance"),
      analyze: z.boolean().optional().describe("Apply analyzer to pattern (default: true)"),
      fuzzy: z.boolean().optional().describe("Enable fuzzy matching"),
      fuzzyMinSimilarity: z.number().optional().describe("Min similarity for fuzzy (0.0-1.0, default: 0.5)"),
      fuzzyPrefixLength: z.number().optional().describe("Prefix length for fuzzy (default: 0)"),
    },
    async ({ branch, ...rest }) => {
      const result = await client.suggestions(branch, rest);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_index_search_comments",
    "Search comments via the Index API. Filter by text, author, mentioned users, or object types.",
    {
      branch: z.string().describe("Branch ID"),
      filter: commentFilterSchema,
      sortField: z.number().optional().describe("Sort field: 0=Id, 1=User, 2=Created, 3=Modified, 4=ObjectId, 5=ObjectType"),
      sortReverse: z.boolean().optional().describe("Reverse sort order"),
      skip: z.number().optional().describe("Number of results to skip"),
      take: z.number().optional().describe("Number of results to return (default: 20)"),
    },
    async ({ branch, filter, sortField, sortReverse, skip, take }) => {
      const sort = sortField !== undefined ? { field: sortField, reverse: sortReverse } : undefined;
      const result = await client.searchComments(branch, { filter, sort, skip, take });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_index_count_comments",
    "Count comments matching a filter via the Index API.",
    {
      branch: z.string().describe("Branch ID"),
      filter: commentFilterSchema,
    },
    async ({ branch, filter }) => {
      const result = await client.countComments(branch, { filter });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_index_work_item_occurrences",
    "Get work item occurrences per branch. Global endpoint (no branch parameter needed).",
    {
      skip: z.number().optional().describe("Number of entries to skip"),
      take: z.number().optional().describe("Number of entries to return"),
    },
    async ({ skip, take }) => {
      const result = await client.workItemOccurrences({ skip, take });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_index_comment_occurrences",
    "Get facet counts for comments (by user, mentioned users, object types) matching a filter.",
    {
      branch: z.string().describe("Branch ID"),
      filter: commentFilterSchema,
      getUserOccurrences: z.boolean().optional().describe("Include user facet counts"),
      getMentionedUsersOccurrences: z.boolean().optional().describe("Include mentioned users facet counts"),
      getObjectTypeOccurrences: z.boolean().optional().describe("Include object type facet counts"),
      skip: z.number().optional().describe("Number of facet entries to skip"),
      take: z.number().optional().describe("Number of facet entries to return (default: 20)"),
    },
    async ({ branch, filter, getUserOccurrences, getMentionedUsersOccurrences, getObjectTypeOccurrences, skip, take }) => {
      const result = await client.commentOccurrences(branch, {
        filter, getUserOccurrences, getMentionedUsersOccurrences, getObjectTypeOccurrences, skip, take,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_index_object_xml_link_count",
    "Count objects whose XML attribute values contain links to specified object IDs.",
    {
      branch: z.string().describe("Branch ID"),
      objectIds: z.array(z.number()).describe("Object IDs to search for in XML links"),
    },
    async ({ branch, objectIds }) => {
      const result = await client.objectXmlLinkCount(branch, { objectIds });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_index_match_strings",
    "Utility to test which strings match a Lucene query expression. Global endpoint (no branch needed).",
    {
      query: z.string().describe("Lucene query expression"),
      useOrOperator: z.boolean().optional().describe("Use OR instead of AND for multiple terms"),
      strings: z.array(z.string()).describe("Strings to test against the query"),
    },
    async ({ query, useOrOperator, strings }) => {
      const result = await client.matchStrings({ query, useOrOperator, strings });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
