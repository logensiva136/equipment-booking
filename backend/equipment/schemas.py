from ninja import Schema


class EquipmentOut(Schema):
    id: str
    name: str
    iconKey: str
    listed: bool


class EquipmentIn(Schema):
    name: str
    iconKey: str
    listed: bool = True


class BookingCreateIn(Schema):
    equipmentId: str
    slotId: str


class BorrowerOut(Schema):
    name: str
    id: str
    role: str | None = None


class BookingMineOut(Schema):
    id: int
    equipment: str
    slot: str
    time: str
    date: str
    status: str


class BookingAdminOut(Schema):
    id: int
    equipment: str
    borrower: BorrowerOut
    slot: str
    time: str
    date: str
    status: str


class BookingStatusIn(Schema):
    status: str


class AvailabilityOut(Schema):
    equipmentId: str
    slotId: str
    status: str
    mine: bool


class ErrorOut(Schema):
    detail: str
