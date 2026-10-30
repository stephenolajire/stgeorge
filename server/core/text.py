import html
import re

from django.utils.html import strip_tags


def to_plain_text(value):
    """Remove any HTML so only plain text is stored. Paragraph and line breaks are kept."""
    if '<' not in value:
        return value.strip()
    value = re.sub(r'(?i)<br\s*/?>', '\n', value)
    value = re.sub(r'(?i)</p>\s*<p[^>]*>', '\n\n', value)
    return html.unescape(strip_tags(value)).strip()
