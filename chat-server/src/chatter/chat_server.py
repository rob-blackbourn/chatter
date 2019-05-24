import aiosqlite
import asyncio
from datetime import datetime, timezone
from typing import List, Mapping, Any, Optional


class ChatServer:

    def __init__(self, sqlite_url) -> None:
        self.sqlite_url = sqlite_url
        self.listeners: List[asyncio.Queue] = []
        self.is_initialised = False


    def add_listener(self, listener: asyncio.Queue) -> None:
        self.listeners.append(listener)


    def remove_listener(self, listener: asyncio.Queue) -> None:
        self.listeners.remove(listener)


    async def chat(self, email: str, content: str) -> Mapping[str, Any]:
        timestamp = datetime.utcnow()
        await self._save_message(timestamp, email, content)
        body = {'timestamp': timestamp, 'email': email, 'content': content}
        for listener in self.listeners:
            await listener.put(body)
        return body


    async def replay_messages(
            self,
            start_date: datetime,
            end_date: datetime,
            max_messages: Optional[int]
    ) -> List[Mapping[str, Any]]:
        async with aiosqlite.connect(self.sqlite_url) as db:
            if not self.is_initialised:
                await self._initialise(db)

            async with db.execute(
                    """
                    SELECT timestamp, email, content 
                    FROM messages 
                    WHERE timestamp >= ? and timestamp < ?
                    ORDER BY timestamp DESC
                    LIMIT ?
                    """,
                    (self._to_timestamp(start_date), self._to_timestamp(end_date), max_messages or 5)
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


    async def fetch_messages(
            self,
            count: int,
            timestamp: Optional[datetime]
    ) -> List[Mapping[str, Any]]:
        async with aiosqlite.connect(self.sqlite_url) as db:
            if not self.is_initialised:
                await self._initialise(db)

            query = """
                SELECT timestamp, email, content 
                FROM messages 
                WHERE timestamp < ?
                ORDER BY timestamp DESC
                LIMIT ?
            """ if timestamp else """
                SELECT timestamp, email, content 
                FROM messages 
                ORDER BY timestamp DESC
                LIMIT ?
            """
            args = (self._to_timestamp(timestamp), count) if timestamp else (count,)

            async with db.execute(query, args) as cursor:

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


    async def _save_message(self, timestamp: datetime, email, content: str) -> None:
        async with aiosqlite.connect(self.sqlite_url) as db:
            if not self.is_initialised:
                await self._initialise(db)
            await db.execute(
                'INSERT INTO messages(timestamp, email, content) values (?, ?, ?)',
                (self._to_timestamp(timestamp), email, content)
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
