from ninja import Schema


class BmiPostOut(Schema):
    key: str
    title: str
    body: str


class BmiPostPatchIn(Schema):
    body: str


class ExerciseOut(Schema):
    id: int
    title: str
    category: str
    duration: str
    level: str
    description: str


class ExerciseIn(Schema):
    title: str
    category: str
    duration: str
    level: str
    description: str


class ErrorOut(Schema):
    detail: str
