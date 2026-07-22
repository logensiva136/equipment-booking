from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'student', 'Student'
        STAFF = 'staff', 'Staff'

    class Gender(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    full_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    height_cm = models.FloatField(null=True, blank=True)
    weight_kg = models.FloatField(null=True, blank=True)
    id_card_photo = models.ImageField(upload_to='id_cards/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.username} ({self.get_role_display()})'


class SiteConfig(models.Model):
    """Singleton row holding the one-time admin setup's company details."""

    company_name = models.CharField(max_length=200, blank=True)
    company_abbr = models.CharField(max_length=8, blank=True)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
