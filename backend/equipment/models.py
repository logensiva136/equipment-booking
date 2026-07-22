from django.conf import settings
from django.db import models


class Equipment(models.Model):
    class IconKey(models.TextChoices):
        RACKET = 'racket', 'Racket'
        BALL_ORANGE = 'ball-orange', 'Ball (orange)'
        BALL_TEAL = 'ball-teal', 'Ball (teal)'
        BALL_DARK = 'ball-dark', 'Ball (dark)'
        BALL_AMBER = 'ball-amber', 'Ball (amber)'
        PADDLE = 'paddle', 'Paddle'
        ROPE = 'rope', 'Rope'
        FRISBEE = 'frisbee', 'Frisbee'

    id = models.SlugField(primary_key=True, max_length=60)
    name = models.CharField(max_length=100)
    icon_key = models.CharField(max_length=20, choices=IconKey.choices)
    listed = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Booking(models.Model):
    class Slot(models.TextChoices):
        MON_THU = 'mon-thu', 'Monday & Thursday'
        TUE_WED_FRI = 'tue-wed-fri', 'Tuesday, Wednesday & Friday'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='bookings')
    slot = models.CharField(max_length=20, choices=Slot.choices)
    borrower = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Slots that currently block a new booking from being made on the same
    # equipment+slot combo (a physical item can only be lent to one person
    # at a time). Only one such booking may exist per (equipment, slot).
    ACTIVE_STATUSES = (Status.PENDING, Status.ACTIVE)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.equipment_id} / {self.slot} / {self.borrower_id} ({self.status})'
