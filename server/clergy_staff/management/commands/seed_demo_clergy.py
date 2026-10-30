from django.core.management.base import BaseCommand

from clergy_staff.models import Member

# Sample people from the design, for trying the admin out. Not real records.
DEMO = [
    ('Rev. Fr. Michael Adewale', 'parish_priest', 'Parish Priest of St. George Catholic Church, Ofatedo.', '0803 123 4567', 'fr.michael@stgeorge.org'),
    ('Rev. Fr. Daniel Chukwu', 'assistant_parish_priest', 'Assistant Parish Priest.', '0806 234 5678', 'fr.daniel@stgeorge.org'),
    ('Rev. Fr. Joseph Bamidele', 'resident_priest', 'Resident Priest.', '0812 345 6789', 'fr.joseph@stgeorge.org'),
    ('Rev. Fr. Stephen Okoro', 'chaplain', 'Chaplain.', '0809 456 7890', 'fr.stephen@stgeorge.org'),
    ('Sr. Maria Grace', 'religious_sister', 'Religious Sister.', '0813 567 8901', 'sr.maria@stgeorge.org'),
    ('Sr. Theresa John', 'religious_sister', 'Religious Sister.', '0805 678 9012', 'sr.theresa@stgeorge.org'),
    ('Mr. Segun Olaleye', 'parish_secretary', 'Parish Secretary.', '0802 789 0123', 'secretary@stgeorge.org'),
    ('Mrs. Funke Adeyemi', 'office_administrator', 'Office Administrator.', '0814 890 1234', 'admin@stgeorge.org'),
    ('Mr. Tunde Kola', 'maintenance_officer', 'Maintenance Officer.', '0807 901 2345', 'maintenance@stgeorge.org'),
    ('Mrs. Blessing Ojo', 'choir_coordinator', 'Choir Coordinator.', '0810 012 3456', 'choir@stgeorge.org'),
    ('Mr. Peter Ade', 'catechist', 'Catechist.', '0811 123 4560', 'catechist@stgeorge.org'),
    ('Mrs. Grace Bello', 'other_staff', 'Parish Accountant.', '0815 234 5601', 'accounts@stgeorge.org'),
]

DEMO_EMAILS = [row[4] for row in DEMO]


class Command(BaseCommand):
    help = 'Add the sample clergy & staff from the design (or remove them with --clear).'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Remove the sample members instead.')

    def handle(self, *args, clear=False, **options):
        if clear:
            deleted, _ = Member.objects.filter(email__in=DEMO_EMAILS).delete()
            self.stdout.write(self.style.SUCCESS(f'Removed {deleted} sample members.'))
            return

        created = 0
        for name, role, bio, phone, email in DEMO:
            _, was_created = Member.objects.get_or_create(
                email=email, defaults={'full_name': name, 'role': role, 'short_bio': bio, 'phone': phone}
            )
            created += was_created
        self.stdout.write(self.style.SUCCESS(f'Added {created} sample members.'))
