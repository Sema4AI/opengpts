import {
  PlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import { ChatListProps } from "../hooks/useChatList";
import { cn } from "../utils/cn";
import { useThreadAndAssistant } from "../hooks/useThreadAndAssistant.ts";
import { useUser } from "../hooks/useUser.ts";
import { User } from "oidc-client-ts";
import { useAuth } from "react-oidc-context";

function UserInfo(props: { user: User }) {
  const { signoutRedirect } = useAuth();
  return (
    <div className="px-4 py-2">
      <div className="flex flex-col justify-between items-center border-t pt-4 mt-4">
        <div>
          <span className="text-sm font-semibold">{`${props.user.profile.email || props.user.profile.sub}`}</span>
        </div>
        <button
          onClick={() => signoutRedirect()}
          className="flex mt-4 items-center px-3 py-1 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function ChatList(props: {
  chats: ChatListProps["chats"];
  enterChat: (id: string | null) => void;
  enterConfig: (id: string | null) => void;
}) {
  const user = useUser();
  const { currentChat, assistantConfig } = useThreadAndAssistant();

  return (
    <>
      <div
        onClick={() => props.enterChat(null)}
        className={cn(
          !currentChat && assistantConfig
            ? "bg-gray-50 text-indigo-600"
            : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
          "group flex gap-x-3 rounded-md -mx-2 p-2 leading-6 font-semibold cursor-pointer",
        )}
      >
        <span
          className={cn(
            !currentChat && assistantConfig
              ? "text-indigo-600 border-indigo-600"
              : "text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600",
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white",
          )}
        >
          <PlusIcon className="h-4 w-4" />
        </span>
        <span className="truncate">New Chat</span>
      </div>

      <div
        onClick={() => props.enterConfig(null)}
        className={cn(
          !assistantConfig
            ? "bg-gray-50 text-indigo-600"
            : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
          "mt-1 group flex gap-x-3 rounded-md -mx-2 p-2 leading-6 font-semibold cursor-pointer",
        )}
      >
        <span
          className={cn(
            !assistantConfig
              ? "text-indigo-600 border-indigo-600"
              : "text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600",
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white",
          )}
        >
          <PlusIcon className="h-4 w-4" />
        </span>
        <span className="truncate">New Bot</span>
      </div>

      <div className="text-xs font-semibold leading-6 text-gray-400 mt-4">
        Your chats
      </div>
      <ul role="list" className="-mx-2 mt-2 space-y-1">
        {props.chats?.map((chat) => (
          <li key={chat.thread_id}>
            <div
              onClick={() => props.enterChat(chat.thread_id)}
              className={cn(
                chat.thread_id === currentChat?.thread_id
                  ? "bg-gray-50 text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                "group flex gap-x-3 rounded-md p-2 leading-6 cursor-pointer",
              )}
            >
              <span
                className={cn(
                  chat.thread_id === currentChat?.thread_id
                    ? "text-indigo-600 border-indigo-600"
                    : "text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600",
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white",
                )}
              >
                {chat.name?.[0] ?? " "}
              </span>
              <span className="truncate">{chat.name}</span>
            </div>
          </li>
        )) ?? (
          <li className="leading-6 p-2 animate-pulse font-black text-gray-400 text-lg">
            ...
          </li>
        )}
      </ul>

      {user && <UserInfo user={user} />}
    </>
  );
}
