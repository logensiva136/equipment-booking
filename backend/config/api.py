from ninja import NinjaAPI

# Session-cookie auth (see accounts/api.py's django_auth endpoints) gets
# CSRF-checked automatically by Ninja's APIKeyCookie base class — no extra
# flag needed here.
api = NinjaAPI(title='FitPoly API')

api.add_router('/', 'accounts.api.router')
api.add_router('/', 'equipment.api.router')
api.add_router('/', 'content.api.router')
api.add_router('/', 'wellness.api.router')
