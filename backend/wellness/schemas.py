from ninja import Schema


class StepSessionIn(Schema):
    mode: str
    elapsedSeconds: int
    steps: int


class StepSessionOut(Schema):
    id: int
    mode: str
    elapsedSeconds: int
    steps: int


class WeeklyStepsOut(Schema):
    day: str
    steps: int | None = None


class JournalIn(Schema):
    mood: str
    text: str


class JournalOut(Schema):
    id: int
    date: str
    mood: str
    text: str


class RewardsOut(Schema):
    points: int
    streak: int
    claimedToday: bool
    badges: dict[str, bool]


class ChatIn(Schema):
    message: str


class ChatOut(Schema):
    reply: str


class ErrorOut(Schema):
    detail: str
