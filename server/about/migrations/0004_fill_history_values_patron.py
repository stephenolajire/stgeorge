from django.db import migrations

# The text the public About page showed before these fields existed.
CONTENT = {
    'core_values': 'Faith in Christ\nPrayer and Worship\nLove and Service\nUnity and Community\nIntegrity and Stewardship',
    'patron': (
        'St. George the Martyr, a witness of unwavering faith and courage. His example inspires us '
        'to stand firm in our faith and to serve God and humanity with boldness and love.'
    ),
    'history_title': 'A Journey of Faith',
    'history': (
        'St. George Catholic Church, Ofatedo, has been a centre of worship, evangelisation and '
        'community life for many years in the Catholic Diocese of Osogbo.\n\n'
        'From humble beginnings, our parish has grown into a vibrant community, united by faith and '
        'a shared commitment to living out the teachings of Christ. Through the dedication of our '
        'priests, religious, and lay faithful, the parish continues to flourish as a home for all.'
    ),
}


def fill_new_fields(apps, schema_editor):
    """Give the existing About page the text it already showed, so nothing disappears."""
    AboutPage = apps.get_model('about', 'AboutPage')
    for page in AboutPage.objects.all():
        for field, value in CONTENT.items():
            if not getattr(page, field):
                setattr(page, field, value)
        page.save(update_fields=list(CONTENT))


class Migration(migrations.Migration):
    dependencies = [('about', '0003_history_values_patron')]

    operations = [migrations.RunPython(fill_new_fields, migrations.RunPython.noop)]
