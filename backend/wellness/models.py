from django.conf import settings
from django.db import models


class StepSession(models.Model):
    class Mode(models.TextChoices):
        WALK = 'walk', 'Walk'
        JOG = 'jog', 'Jog'
        RUN = 'run', 'Run'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='step_sessions')
    mode = models.CharField(max_length=10, choices=Mode.choices)
    elapsed_seconds = models.PositiveIntegerField()
    steps = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class JournalEntry(models.Model):
    class Mood(models.TextChoices):
        GREAT = 'great', 'Great'
        GOOD = 'good', 'Good'
        OKAY = 'okay', 'Okay'
        TIRED = 'tired', 'Tired'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='journal_entries')
    mood = models.CharField(max_length=10, choices=Mood.choices)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class Reward(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reward')
    points = models.PositiveIntegerField(default=0)
    streak = models.PositiveIntegerField(default=0)
    last_claim_date = models.DateField(null=True, blank=True)

    @classmethod
    def get_for(cls, user):
        obj, _ = cls.objects.get_or_create(user=user)
        return obj
