from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import SiteConfig, User


@admin.register(SiteConfig)
class SiteConfigAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'company_abbr')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'role', 'is_verified', 'is_staff', 'is_superuser')
    list_filter = ('role', 'is_verified', 'is_staff')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('FitPoly profile', {
            'fields': ('role', 'full_name', 'phone', 'gender', 'height_cm', 'weight_kg', 'id_card_photo', 'is_verified'),
        }),
    )
