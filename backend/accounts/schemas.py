from ninja import Schema


class UserOut(Schema):
    id: int
    username: str
    name: str
    role: str
    email: str
    phone: str
    gender: str
    height_cm: float | None = None
    weight_kg: float | None = None
    is_verified: bool
    isAdmin: bool

    @staticmethod
    def resolve_name(user):
        return user.full_name

    @staticmethod
    def resolve_isAdmin(user):
        return user.is_staff


class LoginIn(Schema):
    username: str
    password: str
    rememberMe: bool = False


class ErrorOut(Schema):
    detail: str
    errors: dict[str, str] | None = None


class SetupStatusOut(Schema):
    hasAdmin: bool
    companyName: str
    companyAbbr: str


class PasswordResetIn(Schema):
    email: str


class OkOut(Schema):
    detail: str


class AdminUserOut(Schema):
    id: int
    name: str
    role: str
    idLabel: str
    idNumber: str
    email: str
    phone: str
    gender: str
    height: float | None = None
    weight: float | None = None
    verified: bool
    registered: str
