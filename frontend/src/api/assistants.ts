import { Config } from "../hooks/useConfigList";

export async function getAssistant(
  assistantId: string,
  fetchFn = fetch,
): Promise<Config | null> {
  try {
    const response = await fetchFn(`/assistants/${assistantId}`);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as Config;
  } catch (error) {
    console.error("Failed to fetch assistant:", error);
    return null;
  }
}
