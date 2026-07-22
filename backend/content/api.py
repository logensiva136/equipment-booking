from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.security import django_auth

from .models import BmiPost, Exercise
from .schemas import BmiPostOut, BmiPostPatchIn, ErrorOut, ExerciseIn, ExerciseOut

router = Router(tags=['content'])


def _forbid_non_staff(request):
    if not request.user.is_staff:
        return 403, {'detail': 'Admin access required.'}
    return None


@router.get('/content/bmi', response=dict[str, list[BmiPostOut]], auth=None)
def list_bmi_posts(request):
    posts = {}
    for post in BmiPost.objects.all():
        posts.setdefault(post.category, []).append(
            {'key': post.key, 'title': post.title, 'body': post.body}
        )
    return posts


@router.patch(
    '/admin/content/bmi/{category}/{key}',
    response={200: BmiPostOut, 400: ErrorOut, 403: ErrorOut, 404: ErrorOut},
    auth=django_auth,
)
def update_bmi_post(request, category: str, key: str, payload: BmiPostPatchIn):
    if (forbidden := _forbid_non_staff(request)):
        return forbidden
    post = get_object_or_404(BmiPost, category=category, key=key)
    post.body = payload.body
    post.save()
    return 200, {'key': post.key, 'title': post.title, 'body': post.body}


@router.get('/content/exercises', response=list[ExerciseOut], auth=None)
def list_exercises(request):
    return list(Exercise.objects.all())


@router.post('/admin/content/exercises', response={201: ExerciseOut, 400: ErrorOut, 403: ErrorOut}, auth=django_auth)
def create_exercise(request, payload: ExerciseIn):
    if (forbidden := _forbid_non_staff(request)):
        return forbidden
    if payload.category not in Exercise.Category.values:
        return 400, {'detail': 'Invalid category.'}
    if payload.level not in Exercise.Level.values:
        return 400, {'detail': 'Invalid level.'}
    exercise = Exercise.objects.create(**payload.dict())
    return 201, exercise


@router.patch(
    '/admin/content/exercises/{exercise_id}',
    response={200: ExerciseOut, 400: ErrorOut, 403: ErrorOut, 404: ErrorOut},
    auth=django_auth,
)
def update_exercise(request, exercise_id: int, payload: ExerciseIn):
    if (forbidden := _forbid_non_staff(request)):
        return forbidden
    exercise = get_object_or_404(Exercise, pk=exercise_id)
    if payload.category not in Exercise.Category.values:
        return 400, {'detail': 'Invalid category.'}
    if payload.level not in Exercise.Level.values:
        return 400, {'detail': 'Invalid level.'}
    for field, value in payload.dict().items():
        setattr(exercise, field, value)
    exercise.save()
    return 200, exercise


@router.delete('/admin/content/exercises/{exercise_id}', response={204: None, 403: ErrorOut, 404: ErrorOut}, auth=django_auth)
def delete_exercise(request, exercise_id: int):
    if (forbidden := _forbid_non_staff(request)):
        return forbidden
    exercise = get_object_or_404(Exercise, pk=exercise_id)
    exercise.delete()
    return 204, None
