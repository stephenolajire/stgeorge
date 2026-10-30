from django.db import models


class CardIcon(models.TextChoices):
    """Icons for small feature/highlight cards. Keys match frontend/src/utils/highlightIcons.ts."""

    CHURCH = 'church', 'Church'
    USERS = 'users', 'People'
    BOOK = 'book', 'Book'
    HANDS = 'hands', 'Helping hands'
    CALENDAR = 'calendar', 'Calendar'
    CROSS = 'cross', 'Cross'
    MUSIC = 'music', 'Music'
    HEART = 'heart', 'Heart'
