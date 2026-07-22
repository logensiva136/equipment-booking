from django.core.management.base import BaseCommand

from content.models import BmiPost, Exercise
from content.seed_data import EXERCISES, GUIDANCE_POSTS


class Command(BaseCommand):
    help = 'Seeds the fixed BMI/diet guidance posts and sample exercise tutorials.'

    def handle(self, *args, **options):
        for category, posts in GUIDANCE_POSTS.items():
            for key, title, body in posts:
                BmiPost.objects.update_or_create(
                    category=category, key=key, defaults={'title': title, 'body': body},
                )

        for title, category, duration, level, description in EXERCISES:
            Exercise.objects.update_or_create(
                title=title,
                defaults={'category': category, 'duration': duration, 'level': level, 'description': description},
            )

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {BmiPost.objects.count()} BMI posts and {Exercise.objects.count()} exercises.'
        ))
