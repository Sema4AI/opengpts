import { useCallback, useEffect, useReducer } from "react";
import orderBy from "lodash/orderBy";
import {useAuth} from "react-oidc-context";
import {User} from "oidc-client-ts";

export interface Message {
  id: string;
  type: string;
  content:
    | string
    | { page_content: string; metadata: Record<string, object> }[]
    | object;
  name?: string;
  additional_kwargs?: {
    name?: string;
    function_call?: {
      name?: string;
      arguments?: string;
    };
    tool_calls?: {
      id: string;
      function?: {
        name?: string;
        arguments?: string;
      };
    }[];
  };
  example: boolean;
}

export interface Chat {
  assistant_id: string;
  thread_id: string;
  name: string;
  updated_at: string;
}

export interface ChatListProps {
  chats: Chat[] | null;
  createChat: (
    name: string,
    assistant_id: string,
    thread_id?: string,
  ) => Promise<Chat>;
}

function chatsReducer(
  state: Chat[] | null,
  action: Chat | Chat[],
): Chat[] | null {
  state = state ?? [];
  if (!Array.isArray(action)) {
    const newChat = action;
    action = [
      ...state.filter((c) => c.thread_id !== newChat.thread_id),
      newChat,
    ];
  }
  return orderBy(action, "updated_at", "desc");
}

export function useChatList(): ChatListProps {
  const auth = useAuth();

  console.log(auth.user?.access_token);

  const [chats, setChats] = useReducer(chatsReducer, null);

  useEffect(() => {
    async function fetchChats(user: User) {
      const chats = await fetch("/threads/", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user.access_token}`
        },
      }).then((r) => r.json());
      setChats(chats);
    }

    if (auth.user)
      fetchChats(auth.user);
  }, [auth.user]);

  const createChat = useCallback(async (name: string, assistant_id: string) => {
    const response = await fetch(`/threads`, {
      method: "POST",
      body: JSON.stringify({ assistant_id, name }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const saved = await response.json();
    setChats(saved);
    return saved;
  }, []);

  return {
    chats,
    createChat,
  };
}
