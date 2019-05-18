from ..chat_server import ChatServer


async def send_message(root, info, *args, **kwargs):
    content = kwargs['content']
    try:
        chat_server: ChatServer = info.context['chat_server']
        email: str = info.content['email']
        await chat_server.chat(email, content)
        return 'ok'
    except:
        raise
