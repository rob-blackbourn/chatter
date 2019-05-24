from graphql import GraphQLObjectType
from .replay_messages import ReplayMessagesQuery
from .fetch_messages import FetchMessagesQuery

RootQueryType = GraphQLObjectType(
    name='Queries',
    fields=lambda: {
        'replayMessages': ReplayMessagesQuery,
        'fetchMessages': FetchMessagesQuery
    }
)

__all__ = [
    'RootQueryType'
]
