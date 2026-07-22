import re

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.middleware.csrf import get_token
from ninja import File, Form, Router
from ninja.files import UploadedFile
from ninja.security import django_auth

from django.shortcuts import get_object_or_404

from .models import SiteConfig, User
from .schemas import (
    AdminUserOut,
    ErrorOut,
    LoginIn,
    OkOut,
    PasswordResetIn,
    SetupStatusOut,
    UserOut,
)

router = Router(tags=['accounts'])

EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')


def _forbid_non_staff(request):
    if not request.user.is_staff:
        return 403, {'detail': 'Admin access required.'}
    return None


def _display_date(dt):
    # %-d (no leading zero) isn't portable to Windows' strftime, so build
    # the "3 Feb 2026" format manually instead.
    return f"{dt.day} {dt.strftime('%b %Y')}"


def _user_to_admin_out(user):
    return {
        'id': user.id,
        'name': user.full_name or user.username,
        'role': user.get_role_display(),
        'idLabel': 'Matrix No.' if user.role == User.Role.STUDENT else 'Staff ID',
        'idNumber': user.username,
        'email': user.email,
        'phone': user.phone,
        'gender': user.get_gender_display(),
        'height': user.height_cm,
        'weight': user.weight_kg,
        'verified': user.is_verified,
        'registered': _display_date(user.date_joined),
    }


def _apply_remember_me(request, remember_me):
    if remember_me:
        request.session.set_expiry(60 * 60 * 24 * 14)  # 2 weeks
    else:
        request.session.set_expiry(0)  # expires when the browser closes


@router.get('/csrf', auth=None)
def get_csrf(request):
    """Primes the csrftoken cookie. Call once on app load before any POST."""
    get_token(request)
    return {'detail': 'ok'}


@router.post('/register', response={201: UserOut, 400: ErrorOut, 409: ErrorOut}, auth=None)
def register(
    request,
    userType: str = Form(...),
    name: str = Form(...),
    idNumber: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    gender: str = Form(...),
    height: float = Form(...),
    weight: float = Form(...),
    idFile: UploadedFile = File(...),
):
    errors = {}
    if userType not in (User.Role.STUDENT, User.Role.STAFF):
        errors['userType'] = 'Invalid user type.'
    if not name.strip():
        errors['name'] = 'Enter your full name.'
    if not idNumber.strip():
        errors['idNumber'] = 'Enter your ID number.'
    if not email.strip() or not EMAIL_RE.match(email):
        errors['email'] = 'Enter a valid email address.'
    if len(re.sub(r'\D', '', phone)) < 9:
        errors['phone'] = 'Enter a valid phone number.'
    if len(password) < 8:
        errors['password'] = 'Use at least 8 characters.'
    if gender not in (User.Gender.MALE, User.Gender.FEMALE):
        errors['gender'] = 'Select your gender.'
    if height <= 0:
        errors['height'] = 'Enter your height in cm.'
    if weight <= 0:
        errors['weight'] = 'Enter your body weight in kg.'
    if errors:
        return 400, {'detail': 'Validation failed.', 'errors': errors}

    if User.objects.filter(username=idNumber).exists():
        return 409, {'detail': 'An account with this ID number already exists.'}

    user = User(
        username=idNumber,
        full_name=name,
        email=email,
        phone=phone,
        role=userType,
        gender=gender,
        height_cm=height,
        weight_kg=weight,
        id_card_photo=idFile,
        is_verified=False,
    )
    user.set_password(password)
    user.save()
    return 201, user


@router.post('/login', response={200: UserOut, 401: ErrorOut}, auth=None)
def login_view(request, payload: LoginIn):
    user = authenticate(request, username=payload.username, password=payload.password)
    if user is None:
        return 401, {'detail': 'Invalid ID number or password.'}
    login(request, user)
    _apply_remember_me(request, payload.rememberMe)
    return 200, user


@router.post('/logout', auth=django_auth)
def logout_view(request):
    logout(request)
    return {'detail': 'ok'}


@router.get('/me', response={200: UserOut, 401: ErrorOut}, auth=django_auth)
def me(request):
    return 200, request.user


@router.get('/setup/status', response=SetupStatusOut, auth=None)
def setup_status(request):
    config = SiteConfig.get_solo()
    return {
        'hasAdmin': User.objects.filter(is_superuser=True).exists(),
        'companyName': config.company_name,
        'companyAbbr': config.company_abbr,
    }


@router.post('/setup/admin', response={201: UserOut, 400: ErrorOut, 409: ErrorOut}, auth=None)
def setup_admin(
    request,
    name: str = Form(...),
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    confirmPassword: str = Form(...),
    companyName: str = Form(...),
    companyAbbr: str = Form(...),
):
    if User.objects.filter(is_superuser=True).exists():
        return 409, {'detail': 'An admin account already exists.'}

    errors = {}
    if not name.strip():
        errors['name'] = 'Enter the admin’s full name.'
    if not username.strip() or ' ' in username:
        errors['username'] = 'Username is required and cannot contain spaces.'
    if not email.strip() or not EMAIL_RE.match(email):
        errors['email'] = 'Enter a valid email address.'
    if len(password) < 8:
        errors['password'] = 'Use at least 8 characters.'
    if confirmPassword != password:
        errors['confirmPassword'] = 'Passwords do not match.'
    if not companyName.strip():
        errors['companyName'] = 'Enter a company / campus name.'
    if not companyAbbr.strip():
        errors['companyAbbr'] = 'Enter a company abbreviation.'
    if errors:
        return 400, {'detail': 'Validation failed.', 'errors': errors}

    if User.objects.filter(username=username).exists():
        return 409, {'detail': 'That username is already taken.'}

    admin = User(
        username=username,
        full_name=name,
        email=email,
        role=User.Role.STAFF,
        is_staff=True,
        is_superuser=True,
        is_verified=True,
    )
    admin.set_password(password)
    admin.save()

    config = SiteConfig.get_solo()
    config.company_name = companyName
    config.company_abbr = companyAbbr[:8].upper()
    config.save()

    return 201, admin


@router.post('/admin/login', response={200: UserOut, 401: ErrorOut, 403: ErrorOut}, auth=None)
def admin_login(request, payload: LoginIn):
    user = authenticate(request, username=payload.username, password=payload.password)
    if user is None:
        return 401, {'detail': 'Invalid username or password.'}
    if not user.is_staff:
        return 403, {'detail': 'This account does not have admin access.'}
    login(request, user)
    _apply_remember_me(request, payload.rememberMe)
    return 200, user


@router.post('/password-reset', response=OkOut, auth=None)
def password_reset(request, payload: PasswordResetIn):
    generic = {'detail': 'If an account is registered with that email, a reset link is on its way.'}
    user = User.objects.filter(email__iexact=payload.email).first()
    if user is None:
        return generic

    token = default_token_generator.make_token(user)
    # Dev-only: EMAIL_BACKEND is the console backend, so this prints to the
    # runserver log instead of actually sending mail.
    send_mail(
        subject='Reset your FitPoly password',
        message=f'Use this token to reset your password: {token}\n(user id: {user.pk})',
        from_email=None,
        recipient_list=[user.email],
        fail_silently=True,
    )
    return generic


@router.get('/admin/users', response={200: list[AdminUserOut], 403: ErrorOut}, auth=django_auth)
def admin_list_users(request):
    if (forbidden := _forbid_non_staff(request)):
        return forbidden
    users = User.objects.filter(is_superuser=False).order_by('-date_joined')
    return 200, [_user_to_admin_out(u) for u in users]


@router.post('/admin/users/{user_id}/approve', response={200: AdminUserOut, 403: ErrorOut, 404: ErrorOut}, auth=django_auth)
def admin_approve_user(request, user_id: int):
    if (forbidden := _forbid_non_staff(request)):
        return forbidden
    user = get_object_or_404(User, pk=user_id, is_superuser=False)
    user.is_verified = True
    user.save()
    return 200, _user_to_admin_out(user)


@router.post('/admin/users/{user_id}/reject', response={200: AdminUserOut, 403: ErrorOut, 404: ErrorOut}, auth=django_auth)
def admin_reject_user(request, user_id: int):
    if (forbidden := _forbid_non_staff(request)):
        return forbidden
    user = get_object_or_404(User, pk=user_id, is_superuser=False)
    user.is_verified = False
    user.save()
    return 200, _user_to_admin_out(user)
