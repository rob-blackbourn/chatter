from bareasgi import (
    Application,
    Scope,
    Info,
    Message
)
from bareasgi_cors import CORSMiddleware
from bareasgi_graphql_next import add_graphql_next
from datetime import timedelta
import uvicorn
from .auth_service import AuthService
from .auth_controller import AuthController
from .token_manager import TokenManager
from .jwt_authentication import JwtAuthenticator
from .chat_server import ChatServer
from .schema import schema


# noinspection PyUnusedLocal
async def start_chat_server(scope: Scope, info: Info, request: Message) -> None:
    chat_server = ChatServer('chatter.db')
    info['chat_server'] = chat_server


def start():
    # host = 'ugsb-rbla01.bhdgsystematic.com'
    domain = b'bhdgsystematic.com'
    # host = 'localhost'
    # domain = 'localhost'
    port = 9007

    chat_server = ChatServer('chatter.db')
    auth_service = AuthService('chatter.db')
    token_manager = TokenManager(
        'secret',
        timedelta(hours=2),
        'example.com',
        b'chatter-auth',
        domain,
        b'/chatter/api',
        timedelta(days=2)
    )
    auth_controller = AuthController(
        auth_service,
        token_manager,
        timedelta(days=1)
    )
    jwt_authenticator = JwtAuthenticator(
        auth_service,
        token_manager
    )

    cors_middleware = CORSMiddleware()
    app = Application(info={'chat_server': chat_server}, middlewares=[cors_middleware])
    add_graphql_next(app, schema, rest_middleware=jwt_authenticator, path_prefix='/chatter/api')
    auth_controller.add_routes(app, '/chatter/api')

    # ssl_keyfile = os.path.expanduser('~/.keys/ugsb-rbla01.key')
    # ssl_certfile = os.path.expanduser('~/.keys/ugsb-rbla01.crt')
    # uvicorn.run(app, host='0.0.0.0', port=port, ssl_keyfile=ssl_keyfile, ssl_certfile=ssl_certfile)

    uvicorn.run(app, host='0.0.0.0', port=port)
