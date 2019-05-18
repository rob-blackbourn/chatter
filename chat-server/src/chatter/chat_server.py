import aiosqlite
import asyncio
from datetime import datetime, timezone
from typing import List, Mapping, Any


class ChatServer:

    def __init__(self, sqlite_url) -> None:
        self.sqlite_url = sqlite_url
        self.listeners: List[asyncio.Queue] = []
        self.is_initialised = False


    def add_listener(self, listener: asyncio.Queue) -> None:
        self.listeners.append(listener)


    def remove_listener(self, listener: asyncio.Queue) -> None:
        self.listeners.remove(listener)


    async def chat(self, email: str, content: str) -> None:
        await self._save_message(email, content)
        body = {'email': email, 'content': content}
        for listener in self.listeners:
            await listener.put(body)


    async def fetch_messages(self, start_date: datetime, end_date: datetime) -> List[Mapping[str, Any]]:
        async with aiosqlite.connect(self.sqlite_url) as db:
            if not self.is_initialised:
                await self._initialise(db)

            async with db.execute(
                    'SELECT timestamp, email, content FROM messages WHERE timestamp >= ? and timestamp < ?',
                    (self._to_timestamp(start_date), self._to_timestamp(end_date))
            ) as cursor:

                messages = []
                async for timestamp, email, content in cursor:
                    messages.append(
                        {
                            'timestamp': self._from_timestamp(timestamp),
                            'email': email,
                            'content': content
                        }
                    )
                return messages


    async def _save_message(self, email, content: str) -> None:
        async with aiosqlite.connect(self.sqlite_url) as db:
            if not self.is_initialised:
                await self._initialise(db)
            await db.execute(
                'INSERT INTO messages(timestamp, email, content) values (?, ?, ?)',
                (self._to_timestamp(datetime.utcnow()), email, content)
            )
            await db.commit()


    async def _initialise(self, db: aiosqlite.Connection) -> None:
        await db.execute("""
        CREATE TABLE IF NOT EXISTS messages
        (
            timestamp INT NOT NULL,
            email TEXT NOT NULL,
            content TEXT NOT NULL,
            PRIMARY KEY (timestamp)
        )
        """)
        await db.commit()
        self.is_initialised = True


    @classmethod
    def _to_timestamp(cls, value: datetime) -> int:
        return int(value.timestamp() * 1000)


    @classmethod
    def _from_timestamp(cls, value: int) -> datetime:
        return datetime.utcfromtimestamp(value / 1000).replace(tzinfo=timezone.utc)
