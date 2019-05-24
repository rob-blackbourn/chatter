from datetime import datetime
from typing import Optional
from ..chat_server import ChatServer
from ..utils import to_datetime


def as_datetime(value: Optional[str]) -> Optional[datetime]:
    return to_datetime(value) if value else None


async def replay_messages(root, info, *args, **kwargs):
    chat_server: ChatServer = info.context['chat_server']
    start_date = to_datetime(kwargs['startDate'])
    end_date = to_datetime(kwargs['endDate'])
    max_messages = kwargs.get('maxMessages')
    messages = await chat_server.replay_messages(start_date, end_date, max_messages)
    return messages


async def fetch_messages(root, info, *args, **kwargs):
    chat_server: ChatServer = info.context['chat_server']
    count: int = kwargs['count']
    timestamp = as_datetime(kwargs.get('timestamp'))
    messages = await chat_server.fetch_messages(count, timestamp)
    return messages
