from django.db import migrations

# The design's cards (editable afterwards). Quick-link photos are added in the admin.
HIGHLIGHTS = [
    ('Worship', 'Encounter God through the Holy Mass and the Sacraments.', 'cross'),
    ('Community', 'A family united in faith, prayer and love.', 'users'),
    ('Service', 'Reaching out to others as Christ taught us.', 'hands'),
    ('Growth', 'Nurturing faith through formation and discipleship.', 'sprout'),
]
LINKS = [
    ('Mass Schedule', 'Join us for daily and Sunday Holy Mass.', 'View Mass Times', 'mass_times'),
    ('Sacraments', 'Learn about the Sacraments and how to receive them.', 'Explore', 'sacraments'),
    ('Parish Groups', 'Be part of our vibrant parish communities and groups.', 'Get Involved', 'parish_life'),
]


def seed(apps, schema_editor):
    Highlight = apps.get_model('home', 'HomeHighlight')
    QuickLink = apps.get_model('home', 'QuickLink')
    if not Highlight.objects.exists():
        for order, (title, text, icon) in enumerate(HIGHLIGHTS, start=1):
            Highlight.objects.create(title=title, text=text, icon=icon, order=order)
    if not QuickLink.objects.exists():
        for order, (title, text, label, target) in enumerate(LINKS, start=1):
            QuickLink.objects.create(title=title, text=text, link_label=label, target=target, order=order)


class Migration(migrations.Migration):
    dependencies = [('home', '0001_initial')]

    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]
