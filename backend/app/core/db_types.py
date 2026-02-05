import uuid
from sqlalchemy.types import TypeDecorator
from sqlalchemy.dialects.postgresql import UUID

class GUID(TypeDecorator):
    impl = UUID(as_uuid=True)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if not isinstance(value, uuid.UUID):
            return uuid.UUID(str(value))
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return value
