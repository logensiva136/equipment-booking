from django.contrib import admin

from .models import BmiPost, Exercise


@admin.register(BmiPost)
class BmiPostAdmin(admin.ModelAdmin):
    list_display = ('category', 'key', 'title', 'updated_at')
    list_filter = ('category', 'key')


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'level', 'duration')
    list_filter = ('category', 'level')
