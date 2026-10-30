from django.db import migrations

DEFAULT_PAGE = {
    'hero_title': 'Parish Life',
    'hero_subtitle': 'A vibrant community of faith, prayer, formation and service, living the Gospel together in Christ.',
    'intro_title': 'A Vibrant Parish Community',
    'intro_text': (
        'Parish life at St. George Catholic Church, Ofatedo, is centered on worship, faith formation, '
        'fellowship and service. We journey together as a family, supporting one another in our spiritual '
        'growth and living out the values of the Gospel in our daily lives.'
    ),
}

# The strip of highlights the public page showed before they became editable.
DEFAULT_HIGHLIGHTS = [
    ('Worship', 'Encounter God through the Holy Mass and prayer.', 'church'),
    ('Parish Groups', 'Communities for every age and vocation.', 'users'),
    ('Faith Formation', 'Growing in knowledge and love of our faith.', 'book'),
    ('Service & Outreach', 'Reaching out to those in need.', 'hands'),
    ('Events & Activities', 'Building a stronger parish family.', 'calendar'),
]


def forwards(apps, schema_editor):
    """Copy the old sections into the new page: banner → hero fields, introduction → intro fields, cards → activities."""
    Section = apps.get_model('parish_life', 'Section')
    Page = apps.get_model('parish_life', 'ParishLifePage')
    Activity = apps.get_model('parish_life', 'Activity')
    Highlight = apps.get_model('parish_life', 'Highlight')

    page, _ = Page.objects.get_or_create(pk=1, defaults=DEFAULT_PAGE)
    sections = Section.objects.order_by('order', 'id')

    hero = sections.filter(placement='hero').first()
    if hero:
        page.hero_title = hero.title
        page.hero_subtitle = hero.short_description
        page.hero_image = hero.image.name or None
    intro = sections.filter(placement='intro').first()
    if intro:
        page.intro_title = intro.title
        page.intro_text = intro.content
        page.intro_image = intro.image.name or None
    page.save()

    for position, card in enumerate(sections.filter(placement='card'), start=1):
        Activity.objects.create(
            title=card.title,
            short_description=card.short_description,
            content=card.content or card.short_description,
            image=card.image.name or None,
            is_published=card.is_published,
            order=position,
        )

    if not Highlight.objects.exists():
        for position, (title, text, icon) in enumerate(DEFAULT_HIGHLIGHTS, start=1):
            Highlight.objects.create(title=title, text=text, icon=icon, order=position)


class Migration(migrations.Migration):
    dependencies = [('parish_life', '0003_page_highlights_activities')]

    operations = [migrations.RunPython(forwards, migrations.RunPython.noop)]
