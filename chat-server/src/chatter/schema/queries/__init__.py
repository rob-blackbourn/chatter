from graphql import GraphQLObjectType
from .replay_messages import ReplayMessagesQuery

RootQueryType = GraphQLObjectType(
    name='Queries',
    fields=lambda: {'replayMessages': ReplayMessagesQuery}
)

__all__ = [
    'RootQueryType'
]
