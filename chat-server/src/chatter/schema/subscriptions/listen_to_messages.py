from graphql import (
    GraphQLField
)

from ..types import ChatMessageType

from ...resolvers.subscribers import subscribe_to_messages, resolve_message

ListenToMessagesSubscription = GraphQLField(
    ChatMessageType,
    subscribe=subscribe_to_messages,
    resolve=resolve_message
)
