from django.db import migrations

# The design's text for the strip under the sacraments (editable afterwards).
DEFAULT_FEATURES = [
    ('Scripture Foundation', 'Rooted in the teachings of Christ and the Apostles.', 'book'),
    ('Celebrated by the Church', 'Entrusted to the Church through the Apostolic tradition.', 'church'),
    ('Grace for Daily Life', 'Strengthening us to live as faithful disciples.', 'users'),
    ('For a Fuller Life', 'Helping us grow in holiness and eternal life with God.', 'heart'),
]


def seed(apps, schema_editor):
    Feature = apps.get_model('sacraments', 'SacramentFeature')
    if not Feature.objects.exists():
        for position, (title, text, icon) in enumerate(DEFAULT_FEATURES, start=1):
            Feature.objects.create(title=title, text=text, icon=icon, order=position)


class Migration(migrations.Migration):
    dependencies = [('sacraments', '0002_page_features_icon')]

    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]
