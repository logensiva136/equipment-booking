import re

from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router
from ninja.security import django_auth

from .models import Booking, Equipment
from .schemas import (
    AvailabilityOut,
    BookingAdminOut,
    BookingCreateIn,
    BookingMineOut,
    BookingStatusIn,
    EquipmentIn,
    EquipmentOut,
    ErrorOut,
)

router = Router(tags=['equipment'])

# Display strings the frontend renders per slot -- kept server-side so both
# the student and admin booking lists get identical labels without
# duplicating this table in two places.
SLOT_META = {
    Booking.Slot.MON_THU: {'slot': 'Mon & Thu', 'time': '5:00 PM – 6:30 PM'},
    Booking.Slot.TUE_WED_FRI: {'slot': 'Tue, Wed & Fri', 'time': '5:00 PM – 7:00 PM'},
}
BOOKABLE_SLOT_IDS = set(SLOT_META.keys())


def _slugify(name):
    slug = re.sub(r'[^a-z0-9-]', '', name.lower().strip().replace(' ', '-'))
    return slug or f'item-{int(timezone.now().timestamp())}'


def _unique_slug(name):
    base = _slugify(name)
    slug = base
    n = 2
    while Equipment.objects.filter(pk=slug).exists():
        slug = f'{base}-{n}'
        n += 1
    return slug


def _forbid_non_staff(request):
    if not request.user.is_staff:
        return 403, {'detail': 'Admin access required.'}
    return None


def _display_date(dt):
    # %-d (no leading zero) isn't portable to Windows' strftime, so build
    # the "18 Jul 2026" format manually instead.
    return f"{dt.day} {dt.strftime('%b %Y')}"


def _booking_to_mine(booking):
    meta = SLOT_META[booking.slot]
    return {
        'id': booking.id,
        'equipment': booking.equipment.name,
        'slot': meta['slot'],
        'time': meta['time'],
        'date': _display_date(booking.created_at),
        'status': booking.status,
    }


def _booking_to_admin(booking):
    meta = SLOT_META[booking.slot]
    return {
        'id': booking.id,
        'equipment': booking.equipment.name,
        'borrower': {
            'name': booking.borrower.full_name or booking.borrower.username,
            'id': booking.borrower.username,
            'role': booking.borrower.get_role_display(),
        },
        'slot': meta['slot'],
        'time': meta['time'],
        'date': _display_date(booking.created_at),
        'status': booking.status,
    }


# ---------------------------------------------------------------- #
# Student/staff-facing
# ---------------------------------------------------------------- #

@router.get('/equipment', response=list[EquipmentOut], auth=None)
def list_equipment(request):
    return [
        {'id': e.id, 'name': e.name, 'iconKey': e.icon_key, 'listed': e.listed}
        for e in Equipment.objects.filter(listed=True)
    ]


@router.get('/bookings/availability', response=list[AvailabilityOut], auth=django_auth)
def bookings_availability(request):
    # Which equipment+slot combos are currently taken, for the booking
    # grid's "fully booked" state -- deliberately omits who booked it
    # (that's admin-only info, see /admin/bookings) except to flag the
    # caller's own booking so the UI can label it "You".
    return [
        {
            'equipmentId': b.equipment_id,
            'slotId': b.slot,
            'status': b.status,
            'mine': b.borrower_id == request.user.id,
        }
        for b in Booking.objects.filter(status__in=Booking.ACTIVE_STATUSES)
    ]


@router.post('/bookings', response={201: BookingMineOut, 400: ErrorOut, 409: ErrorOut}, auth=django_auth)
def create_booking(request, payload: BookingCreateIn):
    if payload.slotId not in BOOKABLE_SLOT_IDS:
        return 400, {'detail': 'That slot is not bookable yet.'}

    equipment = Equipment.objects.filter(pk=payload.equipmentId, listed=True).first()
    if equipment is None:
        return 400, {'detail': 'That equipment is not available.'}

    clash = Booking.objects.filter(
        equipment=equipment, slot=payload.slotId, status__in=Booking.ACTIVE_STATUSES,
    ).exists()
    if clash:
        return 409, {'detail': 'That slot is already booked for this item.'}

    booking = Booking.objects.create(
        equipment=equipment, slot=payload.slotId, borrower=request.user, status=Booking.Status.PENDING,
    )
    return 201, _booking_to_mine(booking)


@router.get('/bookings/mine', response=list[BookingMineOut], auth=django_auth)
def my_bookings(request):
    return [_booking_to_mine(b) for b in Booking.objects.filter(borrower=request.user)]


@router.patch('/bookings/{booking_id}', response={200: BookingMineOut, 400: ErrorOut, 403: ErrorOut, 404: ErrorOut}, auth=django_auth)
def cancel_booking(request, booking_id: int, payload: BookingStatusIn):
    booking = get_object_or_404(Booking, pk=booking_id)
    if booking.borrower_id != request.user.id:
        return 403, {'detail': 'You can only cancel your own bookings.'}
    if payload.status != Booking.Status.CANCELLED:
        return 400, {'detail': 'Students may only cancel a booking.'}
    if booking.status != Booking.Status.PENDING:
        return 400, {'detail': 'Only a pending booking can be cancelled.'}
    booking.status = Booking.Status.CANCELLED
    booking.save()
    return 200, _booking_to_mine(booking)


# ---------------------------------------------------------------- #
# Admin-facing
# ---------------------------------------------------------------- #

@router.get('/admin/equipment', response={200: list[EquipmentOut], 403: ErrorOut}, auth=django_auth)
def admin_list_equipment(request):
    if (forbidden := _forbid_non_staff(request)):
        return forbidden
    return 200, [
        {'id': e.id, 'name': e.name, 'iconKey': e.icon_key, 'listed': e.listed}
        for e in Equipment.objects.all()
    ]


@router.post('/admin/equipment', response={201: EquipmentOut, 400: ErrorOut, 403: ErrorOut}, auth=django_auth)
def admin_create_equipment(request, payload: EquipmentIn):
    if (forbidden := _forbid_non_staff(request)):
        return forbidden
    if not payload.name.strip():
        return 400, {'detail': 'Name is required.'}
    if payload.iconKey not in Equipment.IconKey.values:
        return 400, {'detail': 'Invalid icon.'}
    equipment = Equipment.objects.create(
        id=_unique_slug(payload.name), name=payload.name, icon_key=payload.iconKey, listed=payload.listed,
    )
    return 201, {'id': equipment.id, 'name': equipment.name, 'iconKey': equipment.icon_key, 'listed': equipment.listed}


@router.patch('/admin/equipment/{equipment_id}', response={200: EquipmentOut, 400: ErrorOut, 403: ErrorOut, 404: ErrorOut}, auth=django_auth)
def admin_update_equipment(request, equipment_id: str, payload: EquipmentIn):
    if (forbidden := _forbid_non_staff(request)):
        return forbidden
    equipment = get_object_or_404(Equipment, pk=equipment_id)
    if payload.iconKey not in Equipment.IconKey.values:
        return 400, {'detail': 'Invalid icon.'}
    equipment.name = payload.name
    equipment.icon_key = payload.iconKey
    equipment.listed = payload.listed
    equipment.save()
    return 200, {'id': equipment.id, 'name': equipment.name, 'iconKey': equipment.icon_key, 'listed': equipment.listed}


@router.delete('/admin/equipment/{equipment_id}', response={204: None, 403: ErrorOut, 404: ErrorOut}, auth=django_auth)
def admin_delete_equipment(request, equipment_id: str):
    if (forbidden := _forbid_non_staff(request)):
        return forbidden
    equipment = get_object_or_404(Equipment, pk=equipment_id)
    equipment.delete()
    return 204, None


@router.get('/admin/bookings', response={200: list[BookingAdminOut], 403: ErrorOut}, auth=django_auth)
def admin_list_bookings(request):
    if (forbidden := _forbid_non_staff(request)):
        return forbidden
    return 200, [_booking_to_admin(b) for b in Booking.objects.select_related('equipment', 'borrower').all()]


VALID_TRANSITIONS = {
    Booking.Status.PENDING: {Booking.Status.ACTIVE, Booking.Status.CANCELLED},
    Booking.Status.ACTIVE: {Booking.Status.COMPLETED},
}


@router.patch('/admin/bookings/{booking_id}', response={200: BookingAdminOut, 400: ErrorOut, 403: ErrorOut, 404: ErrorOut}, auth=django_auth)
def admin_update_booking(request, booking_id: int, payload: BookingStatusIn):
    if (forbidden := _forbid_non_staff(request)):
        return forbidden
    booking = get_object_or_404(Booking, pk=booking_id)
    if payload.status not in Booking.Status.values:
        return 400, {'detail': 'Invalid status.'}
    allowed = VALID_TRANSITIONS.get(booking.status, set())
    if payload.status not in allowed:
        return 400, {'detail': f'Cannot move a {booking.status} booking to {payload.status}.'}
    booking.status = payload.status
    booking.save()
    return 200, _booking_to_admin(booking)
