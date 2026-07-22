from django.contrib import admin

from .models import Booking, Equipment


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'icon_key', 'listed')
    list_filter = ('listed',)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'equipment', 'slot', 'borrower', 'status', 'created_at')
    list_filter = ('status', 'slot')
