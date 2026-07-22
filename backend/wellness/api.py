import datetime
from collections import defaultdict

from django.db.models import Sum
from django.utils import timezone
from ninja import Router
from ninja.security import django_auth

from equipment.models import Booking

from .models import JournalEntry, Reward, StepSession
from .schemas import (
    ChatIn,
    ChatOut,
    ErrorOut,
    JournalIn,
    JournalOut,
    RewardsOut,
    StepSessionIn,
    StepSessionOut,
    WeeklyStepsOut,
)

router = Router(tags=['wellness'])

WEEK_DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
DAILY_STEP_GOAL = 10000


def _display_date(dt):
    return f"{dt.day} {dt.strftime('%b %Y')}"


# ---------------------------------------------------------------- #
# Steps
# ---------------------------------------------------------------- #

@router.post('/steps/sessions', response={201: StepSessionOut, 400: ErrorOut}, auth=django_auth)
def create_step_session(request, payload: StepSessionIn):
    if payload.mode not in StepSession.Mode.values:
        return 400, {'detail': 'Invalid mode.'}
    if payload.elapsedSeconds < 0 or payload.steps < 0:
        return 400, {'detail': 'elapsedSeconds and steps must be non-negative.'}
    session = StepSession.objects.create(
        user=request.user, mode=payload.mode, elapsed_seconds=payload.elapsedSeconds, steps=payload.steps,
    )
    return 201, {'id': session.id, 'mode': session.mode, 'elapsedSeconds': session.elapsed_seconds, 'steps': session.steps}


@router.get('/steps/weekly', response=list[WeeklyStepsOut], auth=django_auth)
def weekly_steps(request):
    today = timezone.localdate()
    monday = today - datetime.timedelta(days=today.weekday())
    days = [monday + datetime.timedelta(days=i) for i in range(7)]

    sessions = StepSession.objects.filter(user=request.user, created_at__date__in=days)
    totals = defaultdict(int)
    for s in sessions:
        totals[s.created_at.date()] += s.steps

    return [
        {'day': label, 'steps': None if d > today else totals.get(d, 0)}
        for label, d in zip(WEEK_DAY_LABELS, days)
    ]


# ---------------------------------------------------------------- #
# Journal
# ---------------------------------------------------------------- #

@router.post('/journal', response={201: JournalOut, 400: ErrorOut}, auth=django_auth)
def create_journal_entry(request, payload: JournalIn):
    if payload.mood not in JournalEntry.Mood.values:
        return 400, {'detail': 'Invalid mood.'}
    if not payload.text.strip():
        return 400, {'detail': 'Enter a journal entry.'}
    entry = JournalEntry.objects.create(user=request.user, mood=payload.mood, text=payload.text)
    return 201, {'id': entry.id, 'date': _display_date(entry.created_at), 'mood': entry.mood, 'text': entry.text}


@router.get('/journal/mine', response=list[JournalOut], auth=django_auth)
def my_journal_entries(request):
    return [
        {'id': e.id, 'date': _display_date(e.created_at), 'mood': e.mood, 'text': e.text}
        for e in JournalEntry.objects.filter(user=request.user)
    ]


# ---------------------------------------------------------------- #
# Rewards
# ---------------------------------------------------------------- #

def _badges_for(user, reward):
    has_booking = Booking.objects.filter(borrower=user).exists()
    journal_count = JournalEntry.objects.filter(user=user).count()
    days_hit_goal = (
        StepSession.objects.filter(user=user)
        .values('created_at__date')
        .annotate(total=Sum('steps'))
        .filter(total__gte=DAILY_STEP_GOAL)
        .count()
    )
    return {
        'first-booking': has_booking,
        '7-day-streak': reward.streak >= 7,
        'step-goal-5x': days_hit_goal >= 5,
        'journal-keeper': journal_count >= 5,
    }


@router.get('/rewards/mine', response=RewardsOut, auth=django_auth)
def my_rewards(request):
    reward = Reward.get_for(request.user)
    today = timezone.localdate()
    return {
        'points': reward.points,
        'streak': reward.streak,
        'claimedToday': reward.last_claim_date == today,
        'badges': _badges_for(request.user, reward),
    }


@router.post('/rewards/daily-claim', response={200: RewardsOut, 400: ErrorOut}, auth=django_auth)
def claim_daily_reward(request):
    reward = Reward.get_for(request.user)
    today = timezone.localdate()
    if reward.last_claim_date == today:
        return 400, {'detail': 'You already claimed today’s reward.'}

    yesterday = today - datetime.timedelta(days=1)
    reward.streak = reward.streak + 1 if reward.last_claim_date == yesterday else 1
    reward.points += 10
    reward.last_claim_date = today
    reward.save()

    return 200, {
        'points': reward.points,
        'streak': reward.streak,
        'claimedToday': True,
        'badges': _badges_for(request.user, reward),
    }


# ---------------------------------------------------------------- #
# Chat -- keyword-matched canned replies, mirroring the frontend
# prototype's craftReply(). Swap for a real LLM call later.
# ---------------------------------------------------------------- #

def _craft_reply(message):
    m = message.lower()
    if 'water' in m:
        return (
            'Most adults do well with about 2–2.5L a day, more on days you train. '
            'Spreading it through the day works better than chugging it all at once.'
        )
    if 'stretch' in m:
        return (
            "Try this: neck rolls (30s), shoulder circles (30s), standing quad stretch "
            "(30s each side), forward fold (30s), and calf stretch against a wall (30s each side). "
            "You'll find the full routine under the Exercise Guide too."
        )
    if 'bmi' in m:
        return (
            'A BMI between 18.5 and 24.9 is generally considered the normal range. '
            'You can calculate yours on the BMI & Diet Guide page — it’ll also show tailored '
            'exercise and meal guidance.'
        )
    if 'pace' in m or 'run' in m:
        return (
            'To improve pace, mix in interval sessions (short fast bursts with recovery jogs) '
            'once or twice a week, alongside your regular easy runs. Track it on the Step Tracker '
            'to see your trend.'
        )
    if 'sleep' in m:
        return 'Aim for 7–9 hours. Recovery (including sleep) matters as much as training for actually getting fitter.'
    return (
        "Good question! I'm a simple demo assistant for now — once connected to the real backend "
        "I'll be able to give more tailored answers based on your profile and activity."
    )


@router.post('/chat', response=ChatOut, auth=django_auth)
def chat(request, payload: ChatIn):
    return {'reply': _craft_reply(payload.message)}
