from ..chat_server import ChatServer
from ..utils import to_datetime


async def replay_messages(root, info, *args, **kwargs):
    chat_server: ChatServer = info.context['chat_server']
    start_date = to_datetime(kwargs['startDate'])
    end_date = to_datetime(kwargs['endDate'])
    max_messages = kwargs.get('maxMessages')
    messages = await chat_server.fetch_messages(start_date, end_date, max_messages)
    return messages
