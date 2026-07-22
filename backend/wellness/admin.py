from django.contrib import admin

from .models import JournalEntry, Reward, StepSession


@admin.register(StepSession)
class StepSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'mode', 'elapsed_seconds', 'steps', 'created_at')
    list_filter = ('mode',)


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'mood', 'created_at')
    list_filter = ('mood',)


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ('user', 'points', 'streak', 'last_claim_date')
