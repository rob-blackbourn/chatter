import aiosqlite
import asyncio
from chatter.auth_service import AuthService
from datetime import datetime, timedelta
import jwt


async def main_async():
    secret = 'foo'
    token_expiry = timedelta(hours=2)
    issued_at = datetime.utcnow()
    issuer = 'example.com'
    email = 'tom@example.com'

    expiry = issued_at + token_expiry

    payload = {
        'iss': issuer,
        'sub': email,
        'exp': expiry,
        'iat': issued_at
    }

    try:
        token = jwt.encode(payload, key=secret)
        await asyncio.sleep(1)
        payload = jwt.decode(token, key=secret)
        assert payload['iss'] == issuer
        assert payload['sub'] == email
        assert (expiry - datetime.utcfromtimestamp(payload['exp'])) < timedelta(seconds=1)
        assert (issued_at - datetime.utcfromtimestamp(payload['iat'])) < timedelta(seconds=1)
    except jwt.ExpiredSignatureError as error:
        print(error)
    print('Done')


async def test_jwt_no_except():
    secret = 'foo'
    token_expiry = timedelta(hours=2)
    issued_at = datetime.utcnow()
    issuer = 'example.com'
    email = 'tom@example.com'

    expiry = issued_at + token_expiry

    payload = {
        'iss': issuer,
        'sub': email,
        'exp': expiry,
        'iat': issued_at
    }
    token = jwt.encode(payload, key=secret)
    payload = jwt.decode(token, key=secret, options={'verify_exp': False})
    assert payload['iss'] == issuer
    assert payload['sub'] == email
    assert (expiry - datetime.utcfromtimestamp(payload['exp'])) < timedelta(seconds=1)
    assert (issued_at - datetime.utcfromtimestamp(payload['iat'])) < timedelta(seconds=1)
    print('Done')


async def test_auth_service():
    auth_controller = AuthService("auth.db")
    await auth_controller.register('john.smith@example.com', 'trustno1')
    is_authenticated = await auth_controller.authenticate('john.smith@example.com', 'trustno1')
    assert is_authenticated
    is_authenticated = await auth_controller.authenticate('john.smith@example.com', 'password')
    assert not is_authenticated
    is_authenticated = await auth_controller.authenticate('fred.smith@example.com', 'trustno1')
    assert not is_authenticated
    print('Done')

    await  auth_controller.change_password('john.smith@example.com', 'trustno1', 'password')
    is_authenticated = await auth_controller.authenticate('john.smith@example.com', 'trustno1')
    assert not is_authenticated
    is_authenticated = await auth_controller.authenticate('john.smith@example.com', 'password')
    assert is_authenticated
    print('Done')


async def test_sqlite():
    async with aiosqlite.connect(':memory:') as db:
        try:
            await db.execute("""
            CREATE TABLE IF NOT EXISTS
            users
            (
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                PRIMARY KEY (email)
            )
            """)
            print('table create executed')
            await db.commit()
            print('table create commited')

            async with db.execute('SELECT * FROM users') as cursor:
                async for row in cursor:
                    print(row)

            await db.execute("""
            INSERT INTO users(email, password) VALUES ('john.smith@example.com', 'password')
            """)
            await db.execute("""
            INSERT INTO users(email, password) VALUES ('anne.baker@example.com', 'trustno1')
            """)
            await db.commit()

            async with db.execute('SELECT * FROM users') as cursor:
                async for row in cursor:
                    print(row)

            await db.execute("""
            INSERT INTO users(email, password) VALUES ('anne.baker@example.com', 'trustno1')
            """)
            await db.commit()

        except Exception as error:
            print(error)


if __name__ == "__main__":
    asyncio.run(main_async())
