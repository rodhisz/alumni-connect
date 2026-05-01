export type BuilderFilter = {
  field: string;
  operator: "equals" | "contains" | "gt" | "lt" | "not";
  value: any;
};

export type BuilderConfig = {
  entity: "AlumniProfile" | "User" | "News" | "MasterData";
  aggregation: "count" | "sum" | "avg";
  aggregationField?: string;
  filters: BuilderFilter[];
};

export function generateSqlFromBuilder(config: BuilderConfig): string {
  const { entity, aggregation, aggregationField, filters } = config;

  let select = "";
  if (aggregation === "count") {
    select = "COUNT(*) as value";
  } else if (aggregation === "sum" && aggregationField) {
    select = `SUM("${aggregationField}") as value`;
  } else if (aggregation === "avg" && aggregationField) {
    select = `AVG("${aggregationField}") as value`;
  } else {
    select = "COUNT(*) as value";
  }

  let where = "";
  if (filters && filters.length > 0) {
    const filterClauses = filters.map((f) => {
      let val = f.value;
      // Convert to number if it looks like one and isn't empty, to support numeric columns
      if (typeof val === "string" && val.trim() !== "" && !isNaN(Number(val))) {
        val = Number(val);
      } else if (typeof val === "string") {
        val = `'${val.replace(/'/g, "''")}'`;
      }
      
      switch (f.operator) {
        case "equals": return `"${f.field}" = ${val}`;
        case "not": return `"${f.field}" != ${val}`;
        case "contains": return `"${f.field}" LIKE '%${f.value}%'`;
        case "gt": return `"${f.field}" > ${val}`;
        case "lt": return `"${f.field}" < ${val}`;
        default: return "1=1";
      }
    });
    where = ` WHERE ${filterClauses.join(" AND ")}`;
  }

  return `SELECT ${select} FROM "${entity}"${where}`;
}
