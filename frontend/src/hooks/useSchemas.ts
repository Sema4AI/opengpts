import { useEffect, useState } from "react";
import { simplifySchema } from "../utils/simplifySchema";
import { getDefaults } from "../utils/defaults";
import { useAuthFetch } from "./useAuthFetch.ts";

export interface SchemaField {
  type: string;
  title: string;
  description: string;
  enum?: string[];
  items?: SchemaField;
  allOf?: SchemaField[];
}

export interface Schemas {
  configSchema: null | {
    properties: {
      configurable: {
        properties: {
          [key: string]: SchemaField;
        };
      };
    };
  };
  configDefaults: null | {
    configurable?: {
      [key: string]: unknown;
    };
  };
}

export function useSchemas() {
  const authFetch = useAuthFetch();
  const [schemas, setSchemas] = useState<Schemas>({
    configSchema: null,
    configDefaults: null,
  });

  useEffect(() => {
    async function save() {
      const configSchema = await authFetch("/runs/config_schema")
        .then((r) => r.json())
        .then(simplifySchema);
      setSchemas({
        configSchema,
        configDefaults: getDefaults(configSchema) as Record<string, unknown>,
      });
    }

    save();
  }, [authFetch]);

  return schemas;
}
