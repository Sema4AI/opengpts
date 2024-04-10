import { Chat } from "../hooks/useChatList.ts";

export async function getThread(
  threadId: string,
  fetchFn = fetch,
): Promise<Chat | null> {
  try {
    const response = await fetchFn(`/threads/${threadId}`);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as Chat;
  } catch (error) {
    console.error("Failed to fetch assistant:", error);
    return null;
  }
}
