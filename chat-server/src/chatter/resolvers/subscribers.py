import asyncio
from ..chat_server import ChatServer


async def subscribe_to_messages(root, info, *args, **kwargs):
    chat_server: ChatServer = info.context['chat_server']
    queue = asyncio.Queue()
    chat_server.add_listener(queue)

    try:
        while True:
            message = await queue.get()
            yield message
    finally:
        await chat_server.remove_listener(queue)


def resolve_message(root, info, *args, **kwargs):
    return root
