import aiosqlite
import hashlib
import jwt
import logging
from typing import Tuple
import uuid

logger = logging.getLogger(__name__)


class AuthService:

    def __init__(self, sqlite_url: str):
        self.sqlite_url = sqlite_url
        self.is_initialised = False


    async def register(self, email: str, password: str) -> None:
        async with aiosqlite.connect(self.sqlite_url) as db:
            if not self.is_initialised:
                await self._initialise(db)

            if await self._user_exists(db, email):
                raise RuntimeError('Already registered')

            salt, hashed_password = self._generate_password(password)
            await db.execute(
                "INSERT INTO users(email, salt, password) VALUES (?, ?, ?)",
                (email, salt, hashed_password)
            )
            await db.commit()


    async def authenticate(self, email: str, password: str) -> bool:
        async with aiosqlite.connect(self.sqlite_url) as db:
            if not self.is_initialised:
                await self._initialise(db)

            return await self._authenticate(db, email, password)


    async def change_password(self, email, old_password, new_password) -> None:
        async with aiosqlite.connect(self.sqlite_url) as db:
            if not await self._authenticate(db, email, old_password):
                raise RuntimeError('Authentication failed')

            salt, hashed_password = self._generate_password(new_password)
            await db.execute('UPDATE users SET salt = ?, password = ? WHERE email = ?', (salt, hashed_password, email))
            await db.commit()


    async def user_valid(self, email: str) -> bool:
        async with aiosqlite.connect(self.sqlite_url) as db:
            if not self.is_initialised:
                await self._initialise(db)
            return await self._user_exists(db, email)


    async def _authenticate(self, db: aiosqlite.Connection, email: str, password: str):
        if not self.is_initialised:
            await self._initialise(db)

        async with db.execute('SELECT salt, password FROM users WHERE email = ?', (email,)) as cursor:
            async for salt, hashed_password in cursor:
                return self._is_valid_password(password, salt, hashed_password)
        return False


    @classmethod
    async def _user_exists(cls, db: aiosqlite.Connection, email: str) -> bool:
        async with db.execute('SELECT * FROM users WHERE email = ?', (email,)) as cursor:
            async for _ in cursor:
                return True
        return False


    @classmethod
    def _generate_password(cls, password) -> Tuple[str, str]:
        salt = uuid.uuid4().hex
        hashed_password = hashlib.sha512((password + salt).encode()).hexdigest()
        return salt, hashed_password


    @classmethod
    def _is_valid_password(cls, password: str, salt: str, hashed_password: str) -> bool:
        rehashed_password = hashlib.sha512((password + salt).encode()).hexdigest()
        return hashed_password == rehashed_password


    async def _initialise(self, db: aiosqlite.Connection) -> None:
        await db.execute("""
        CREATE TABLE IF NOT EXISTS users
        (
            email TEXT NOT NULL,
            salt TEXT NOT NULL,
            password TEXT NOT NULL,
            PRIMARY KEY (email)
        )
        """)
        self.is_initialised = True
