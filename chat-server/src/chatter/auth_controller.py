from bareasgi import (
    Application,
    Scope,
    Info,
    RouteMatches,
    Content,
    HttpResponse,
    text_reader,
    text_writer
)
import bareasgi.http_response_status_codes as http_status_code
from datetime import datetime, timedelta
import json
import logging

from .auth_service import AuthService
from .token_manager import TokenManager

logger = logging.getLogger(__name__)


# noinspection PyUnusedLocal
class AuthController:

    def __init__(
            self,
            auth_service: AuthService,
            token_manager: TokenManager,
            login_expiry: timedelta
    ) -> None:
        self.auth_service = auth_service
        self.token_manager = token_manager
        self.login_expiry = login_expiry


    def add_routes(self, app: Application, path_prefix: str = ''):
        app.http_router.add({'POST', 'OPTIONS'}, f'{path_prefix}/register', self.register)
        app.http_router.add({'POST', 'OPTIONS'}, f'{path_prefix}/authenticate', self.authenticate)
        app.http_router.add({'GET'}, f'{path_prefix}/renew_token', self.renew_token)
        app.http_router.add({'GET'}, f'{path_prefix}/dummy', self.dummy)


    async def dummy(self, scope: Scope, info: Info, matches: RouteMatches, content: Content) -> HttpResponse:
        try:
            return self._authenticated_response(scope, "foo@bar.com")
        except Exception as error:
            return http_status_code.INTERNAL_SERVER_ERROR, [(b'content-type', b'text/plain')], text_writer(str(error))


    async def register(self, scope: Scope, info: Info, matches: RouteMatches, content: Content) -> HttpResponse:
        try:
            text = await text_reader(content)
            body = json.loads(text)
            await self.auth_service.register(body['email'], body['password'])
            return self._authenticated_response(scope, body['email'])
        except Exception as error:
            return http_status_code.INTERNAL_SERVER_ERROR, [(b'content-type', b'text/plain')], text_writer(str(error))


    async def authenticate(self, scope: Scope, info: Info, matches: RouteMatches, content: Content) -> HttpResponse:
        try:
            body = json.loads(await text_reader(content))
            await self.auth_service.authenticate(body['email'], body['password'])
            return self._authenticated_response(scope, body['email'])
        except Exception as error:
            return http_status_code.INTERNAL_SERVER_ERROR, [(b'content-type', b'text/plain')], text_writer(str(error))


    async def renew_token(self, scope: Scope, info: Info, matches: RouteMatches, content: Content) -> HttpResponse:
        try:
            payload = self.token_manager.get_jwt_payload_from_headers(scope['headers'])
            if payload is None:
                return http_status_code.UNAUTHORIZED, None, None

            email = payload['sub']
            issued_at = payload['iat']

            logger.debug(f'Token renewal request: user={email}, iat={issued_at}')

            utc_now = datetime.utcnow()

            authentication_expiry = issued_at + self.login_expiry
            if utc_now > authentication_expiry:
                return http_status_code.FORBIDDEN, [(b'content-type', b'text/plain')], text_writer('Expired')

            if not await self.auth_service.user_valid(email):
                return http_status_code.FORBIDDEN, [(b'content-type', b'text/plain')], text_writer('Invalid user')

            logger.debug(f'Token renewed: {email}')

            return self._authenticated_response(scope, email)
        except Exception as error:
            return http_status_code.INTERNAL_SERVER_ERROR, [(b'content-type', b'text/plain')], text_writer(str(error))


    def _authenticated_response(self, scope: Scope, email) -> HttpResponse:
        cookie = self.token_manager.generate_cookie(email)
        return http_status_code.NO_CONTENT, [(b'set-cookie', cookie)], None
