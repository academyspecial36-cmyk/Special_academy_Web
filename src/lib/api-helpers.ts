// Re-exports from domain-split API modules for backward compatibility
export {
  ALLOWED_TABLES, RESTRICTED_TABLES, toDbColumn, toCamelCase, transformKeys,
} from "./api/table-config";
export { requireAdmin } from "./api/admin-guard";
export { handleGet, handlePost, handlePut, handleDelete, getIdFromUrl } from "./api/crud-handlers";
