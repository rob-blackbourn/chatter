from graphql import (
    GraphQLObjectType,
)

RootMutationType = GraphQLObjectType(
    name='Mutations',
    fields=lambda: {
        'sendMessage': SendMessageMutation
    }
)

from .send_message import (
    SendMessageMutation
)

__all__ = [
    'RootMutationType'
]
