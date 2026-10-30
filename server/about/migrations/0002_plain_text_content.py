import html
import re

from django.db import migrations
from django.utils.html import strip_tags


def to_plain_text(value):
    if '<' not in value:
        return value.strip()
    value = re.sub(r'(?i)<br\s*/?>', '\n', value)
    value = re.sub(r'(?i)</p>\s*<p[^>]*>', '\n\n', value)
    return html.unescape(strip_tags(value)).strip()


def html_to_plain_text(apps, schema_editor):
    """The About text used to be HTML from a rich text editor; it is now plain text."""
    AboutPage = apps.get_model('about', 'AboutPage')
    for page in AboutPage.objects.all():
        for field in ('description', 'mission', 'vision'):
            setattr(page, field, to_plain_text(getattr(page, field)))
        page.save(update_fields=['description', 'mission', 'vision'])


class Migration(migrations.Migration):
    dependencies = [('about', '0001_initial')]

    operations = [migrations.RunPython(html_to_plain_text, migrations.RunPython.noop)]
