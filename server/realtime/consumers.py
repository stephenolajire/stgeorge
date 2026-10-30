from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .broadcast import GROUP


class ContentUpdatesConsumer(AsyncJsonWebsocketConsumer):
    """
    ws://<host>/ws/updates/

    Sends {"type": "content.changed", "topic": "<area>"} whenever site content changes.
    Messages carry no content, only which area changed, so anyone may listen.
    Browsers only send nothing; anything they do send is ignored.
    """

    async def connect(self):
        await self.channel_layer.group_add(GROUP, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(GROUP, self.channel_name)

    async def receive_json(self, content, **kwargs):
        pass

    async def content_changed(self, event):
        await self.send_json({'type': 'content.changed', 'topic': event['topic']})
