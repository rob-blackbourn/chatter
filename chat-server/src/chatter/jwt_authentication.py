from bareasgi import (
    Scope,
    Info,
    RouteMatches,
    Content,
    HttpResponse,
    HttpRequestCallback,
    text_writer
)
import bareasgi.http_response_status_codes as http_status
from datetime import datetime
import logging
from .auth_service import AuthService
from .token_manager import TokenManager

logger = logging.getLogger(__name__)


class HTTPUnauthorized(Exception):
    pass


class JwtAuthenticator:

    def __init__(
            self,
            auth_service: AuthService,
            token_manager: TokenManager
    ) -> None:
        self.auth_service = auth_service
        self.token_manager = token_manager


    async def __call__(
            self,
            scope: Scope,
            info: Info,
            matches: RouteMatches,
            content: Content,
            handler: HttpRequestCallback
    ) -> HttpResponse:

        logger.debug(f'Jwt Authentication Request: {scope["path"]}')

        try:
            payload = self.token_manager.get_jwt_payload_from_headers(scope['headers'])
            if payload is None:
                return http_status.UNAUTHORIZED, None, None

            now = datetime.utcnow()

            if payload['exp'] > now:
                logger.debug('Cookie still valid')
                cookie = None
            else:
                logger.debug('Renewing cookie')
                if not self.auth_service.user_valid(payload['sub']):
                    return http_status.FORBIDDEN, [(b'content-type', b'text/plain')], text_writer("Invalid user")
                token = self.token_manager.encode(payload['sub'], now, payload['iat'])
                cookie = self.token_manager.make_cookie(token)

            if info:
                info['jwt'] = payload
            else:
                info = {'jwt': payload}

            next_status, next_headers, next_content = await handler(scope, info, matches, content)

            if cookie:
                if next_headers is None:
                    next_headers = []
                next_headers.append((b"set-cookie", cookie))

            return next_status, next_headers, next_content
        except:
            logger.exception("JWT authentication failed")
            return http_status.INTERNAL_SERVER_ERROR, None, None
